
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExpertCard from "@/components/ExpertCard";
import TagFilter from "@/components/TagFilter";
import AIAssist from "@/components/AIAssist";

// Mock data for experts
const mockExperts = [
  {
    id: "1",
    name: "Alex Johnson",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Full-stack developer specializing in React, Node.js, and cloud architecture. 8+ years experience building scalable applications.",
    tags: ["react", "javascript", "node.js", "aws", "typescript"],
    isAvailable: true,
    callCount: 24,
    averageRating: 4.8,
  },
  {
    id: "2",
    name: "Sara Lee",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Product manager with expertise in SaaS and consumer apps. I can help with product strategy, UX research, and growth tactics.",
    tags: ["product-management", "ux", "saas", "growth", "mvp"],
    isAvailable: true,
    callCount: 16,
    averageRating: 4.9,
  },
  {
    id: "3",
    name: "Michael Chen",
    profileImage: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Machine learning engineer focusing on NLP and computer vision. Can help with model training, deployment, and AI infrastructure.",
    tags: ["machine-learning", "python", "tensorflow", "nlp", "ai"],
    isAvailable: false,
    callCount: 31,
    averageRating: 4.7,
  },
  {
    id: "4",
    name: "Emma Williams",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "UI/UX designer passionate about accessible interfaces and design systems. 6 years experience with Figma and design tools.",
    tags: ["ui-design", "ux-design", "figma", "accessibility", "design-systems"],
    isAvailable: true,
    callCount: 19,
    averageRating: 4.6,
  },
  {
    id: "5",
    name: "James Rodriguez",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Marketing specialist with focus on SEO, content strategy, and social media campaigns. I help businesses increase their online visibility.",
    tags: ["marketing", "seo", "content", "social-media", "growth-hacking"],
    isAvailable: false,
    callCount: 12,
    averageRating: 4.5,
  },
];

// Get all unique tags from experts
const allTags = Array.from(
  new Set(mockExperts.flatMap((expert) => expert.tags))
).sort();

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredExperts, setFilteredExperts] = useState(mockExperts);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Filter experts based on search term, selected tags, and availability
  useEffect(() => {
    let filtered = mockExperts;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (expert) =>
          expert.name.toLowerCase().includes(term) ||
          expert.bio.toLowerCase().includes(term) ||
          expert.tags.some((tag) => tag.includes(term))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((expert) =>
        selectedTags.every((tag) => expert.tags.includes(tag))
      );
    }
    
    // Filter by availability
    if (showOnlyAvailable) {
      filtered = filtered.filter((expert) => expert.isAvailable);
    }
    
    setFilteredExperts(filtered);
  }, [searchTerm, selectedTags, showOnlyAvailable]);

  // Handle the AI assistant submission (placeholder)
  const handleAIAssist = async (input: string): Promise<string> => {
    // In a real app, this would call OpenAI or Claude
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Based on your request "${input}", I recommend:
        
1. Try experts with the #javascript, #react, and #frontend tags
2. Be specific about your code error to get faster help
3. Consider including a code snippet when you join the call`);
      }, 1500);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get expert help <span className="text-hotseat-500">on demand</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect with live experts ready to solve your problems right now through
            video calls based on their expertise.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button asChild>
              <Link to="/dashboard">
                Start Helping Others
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Join Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search experts or topics..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className={showOnlyAvailable ? "bg-hotseat-100 dark:bg-hotseat-900" : ""}
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            >
              <Flame className={`mr-2 h-4 w-4 ${showOnlyAvailable ? "text-hotseat-500" : ""}`} />
              Live Now
            </Button>
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
          
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredExperts.length > 0 ? (
              filteredExperts.map((expert) => (
                <ExpertCard key={expert.id} {...expert} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium">No experts found</p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </div>
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
