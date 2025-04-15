
import ExpertCard, { ExpertProps } from "@/components/ExpertCard";

interface ExpertListProps {
  experts: ExpertProps[];
}

const ExpertList = ({ experts }: ExpertListProps) => {
  if (experts.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No experts found</p>
        <p className="text-muted-foreground">
          Try adjusting your filters or search term
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {experts.map((expert) => (
        <ExpertCard key={expert.id} {...expert} />
      ))}
    </div>
  );
};

export default ExpertList;
