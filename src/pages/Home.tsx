
import { useState, useEffect } from "react";
import SearchBar from "@/components/home/SearchBar";
import HeroSection from "@/components/home/HeroSection";
import ExpertList from "@/components/home/ExpertList";
import AvailabilityToggle from "@/components/home/AvailabilityToggle";
import TagFilter from "@/components/TagFilter";
import AIAssist from "@/components/AIAssist";
import { ExpertProps } from "@/components/ExpertCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Fetch experts from Supabase
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ['experts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, bio, avatar_url, is_available, user_expertise_tags(expertise_tags(name))')
        .eq('role', 'expert');

      if (error) throw error;

      return data.map((profile): ExpertProps => ({
        id: profile.id,
        name: profile.full_name || 'Anonymous Expert',
        profileImage: profile.avatar_url,
        bio: profile.bio || 'No bio available',
        tags: profile.user_expertise_tags?.map(tag => tag.expertise_tags.name) || [],
        isAvailable: profile.is_available || false,
      }));
    },
  });

  // Filter experts based on search term, selected tags, and availability
  const filteredExperts = experts.filter(expert => {
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !expert.name.toLowerCase().includes(term) &&
        !expert.bio.toLowerCase().includes(term) &&
        !expert.tags.some(tag => tag.toLowerCase().includes(term))
      ) {
        return false;
      }
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      if (!selectedTags.every(tag => expert.tags.includes(tag))) {
        return false;
      }
    }
    
    // Filter by availability
    if (showOnlyAvailable && !expert.isAvailable) {
      return false;
    }
    
    return true;
  });

  // Get all unique tags from experts for the tag filter
  const allTags = Array.from(
    new Set(experts.flatMap(expert => expert.tags))
  ).sort();

  // Handle the AI assistant submission
  const handleAIAssist = async (input: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Based on your request "${input}", I recommend trying experts with relevant expertise tags and including specific details about what you need help with.`);
      }, 1500);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <HeroSection />
      
      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <AvailabilityToggle
              showOnlyAvailable={showOnlyAvailable}
              onToggle={() => setShowOnlyAvailable(!showOnlyAvailable)}
            />
          </div>
          
          <TagFilter
            selectedTags={selectedTags}
            availableTags={allTags}
            onSelectTag={(tag) => setSelectedTags([...selectedTags, tag])}
            onRemoveTag={(tag) =>
              setSelectedTags(selectedTags.filter((t) => t !== tag))
            }
            onClearTags={() => setSelectedTags([])}
          />
          
          {isLoading ? (
            <div className="text-center py-8">Loading experts...</div>
          ) : (
            <ExpertList experts={filteredExperts} />
          )}
        </div>
        
        <div>
          <AIAssist
            title="Find the Right Expert"
            description="Describe what you need help with, and I'll suggest experts and tags."
            placeholder="E.g., I need help debugging my React component that's causing memory leaks..."
            buttonText="Get Recommendations"
            onSubmit={handleAIAssist}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
