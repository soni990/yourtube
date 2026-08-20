import Videocard from "./Videocard"

const ChannelVideos=({videos}:any)=>{
    if(videos.length === 0){
        return(
            <div className="py-10 text-center">
                <p className="text-muted-foreground text-lg">No videos uploaded yet</p>
            </div>
        )
    }
    
    return(
        <div className=""> 
            <h2 className="text-2xl font-bold mb-4">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video:any)=>(
                    <Videocard key={video._id} video={video}/>
                ))}
            </div>
        </div>
    )
}
export default ChannelVideos