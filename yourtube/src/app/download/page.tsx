import DownloadsContent from "@/components/DownloadsContent";

export default function DownloadPage() {
  return (
   <div className="p-3 sm:p-4 md:p-6">
  <h1 className="text-xl sm:text-2xl font-bold mb-4">
    Downloads
  </h1>

  <DownloadsContent />
</div>
  );
}