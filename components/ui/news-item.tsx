// components/ui/news-item.tsx
export function NewsItem({
  title,
  description,
  timeAgo,
}: {
  title: string;
  description: string;
  timeAgo: string;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}
