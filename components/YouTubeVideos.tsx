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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <div className="aspect-video animate-pulse bg-muted"></div>
              <div className="space-y-3 p-4">
                <div className="h-5 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <p className="font-semibold text-destructive">Error: {error}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Keywords: {keywords.join(", ")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
          >
            <div className="relative aspect-video cursor-pointer overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${video.id}`,
                    "_blank",
                  )
                }
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="bg-red-600 rounded-full p-3 text-white shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3
                className="mb-3 line-clamp-2 cursor-pointer text-base font-semibold text-foreground transition-colors hover:text-primary"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${video.id}`,
                    "_blank",
                  )
                }
              >
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
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch Video
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeVideos;
