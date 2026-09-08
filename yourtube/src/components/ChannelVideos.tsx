import Videocard from "./Videocard"

const ChannelVideos=({videos}:any)=>{
    if(videos.length === 0){
        return(
           <div className="py-8 sm:py-10 px-4 text-center">
  <p className="text-muted-foreground text-base sm:text-lg">
    No videos uploaded yet
  </p>
</div>
        )
    }
    
    return(
        <div className="w-full">
  <h2 className="text-xl sm:text-2xl font-bold mb-4">
    Videos
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
    {videos.map((video: any) => (
      <Videocard key={video._id} video={video} />
    ))}
  </div>
</div>
    )
}
export default ChannelVideos