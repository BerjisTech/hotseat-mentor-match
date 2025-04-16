
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )
    
    const DAILY_API_KEY = Deno.env.get("DAILY_CO") ?? ""
    if (!DAILY_API_KEY) {
      throw new Error("DAILY_CO API key is not set")
    }
    
    const { action, roomName, pricePerMinute, expiryMinutes } = await req.json()
    
    if (action === "createRoom") {
      // Create a Daily.co room
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DAILY_API_KEY}`
        },
        body: JSON.stringify({
          name: roomName || `room-${Math.random().toString(36).substring(2, 11)}`,
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            exp: Math.floor(Date.now() / 1000) + (expiryMinutes || 60) * 60
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create room: ${error.message}`)
      }
      
      const data = await response.json()
      
      // Store room info in the database with pricing info
      const { error: insertError } = await supabaseClient
        .from('call_rooms')
        .insert({
          room_name: data.name,
          room_url: data.url,
          price_per_minute: pricePerMinute || 0,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (expiryMinutes || 60) * 60 * 1000).toISOString()
        })
      
      if (insertError) {
        console.error("Error storing room info:", insertError)
      }
      
      return new Response(
        JSON.stringify({ url: data.url, roomName: data.name }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } else if (action === "getRoomDetails") {
      // Get details for a Daily.co room
      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${DAILY_API_KEY}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: "Room not found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          )
        }
        throw new Error(`Failed to get room details: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Get pricing info from our database
      const { data: roomData, error: roomError } = await supabaseClient
        .from('call_rooms')
        .select('*')
        .eq('room_name', roomName)
        .single()
      
      return new Response(
        JSON.stringify({ 
          ...data, 
          pricePerMinute: roomData?.price_per_minute || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  } catch (error) {
    console.error("Error processing request:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
