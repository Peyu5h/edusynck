import React, { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

interface YouTubeVideosProps {
  keywords: string[];
}

const YouTubeVideos: React.FC<YouTubeVideosProps> = ({ keywords }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Keywords:", keywords);

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/youtube`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              keywords: keywords.join(" "),
              excludeTerms: "shorts",
              relevanceLanguage: "en",
              type: "video",
            }),
          },
        );
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch videos: ${response.status} ${response.statusText}. Error: ${errorText}`,
          );
        }
        const data = await response.json();
        setVideos(
          data.items
            .filter(
              (item: any) =>
                !item.snippet.title.toLowerCase().includes("#short"),
            )
            .map((item: any) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium.url,
            })),
        );
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(`Error fetching videos: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    if (keywords.length > 0) {
      fetchVideos();
    } else {
      console.log("No keywords provided");
      setLoading(false);
    }
  }, [keywords]);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Error: {error}</p>
          <p>Keywords: {keywords.join(", ")}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="overflow-hidden rounded-lg shadow-lg">
            <div className="relative pb-[56.25%]">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute left-0 top-0 h-full w-full"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
                {video.title}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${video.id}`,
                    "_blank",
                  )
                }
                className="flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in YouTube
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeVideos;
