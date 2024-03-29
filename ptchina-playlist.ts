interface IFile{
	filename:string
	extension:string
	duration:number
	originalFilename:string
}

interface IReply{
	files:IFile[]|undefined
}

interface IFio{
	files:IFile[]|undefined
	replies:IReply[]
	board:string
	postId:number
}

async function getFio():Promise<IFio> {

	let link = window.location.href
	link = link.replace(".html",".json")
	
	return await fetch(link).then(async (res)=>{
		const fio = await res.json() as IFio
	
		return fio
	})
	
}

async function getMedia(fio:IFio){
	const fileTypes = [".mp4",".mp3",".webm"]
	const files:IFile[] = []

	let link = window.location.href
	link = link.replace(".html",".json")

	fio.files?.forEach((f)=>{
		if(fileTypes.includes(f.extension) )
		{
			files.push(f)
		}
	})

	for (let i = 0; i < fio.replies.length; i++) {
		const element = fio.replies[i].files;
		element?.forEach((f)=>{
			if(fileTypes.includes(f.extension) )
			{
				files.push(f)
			}
		})
	}

	return files
}

function createPlaylist(filename:string,medias:IFile[]){
	const lines:string[] = []

	lines.push("#EXTM3U")

	for (let i = 0; i < medias.length; i++) {
		const media = medias[i];

		lines.push(`#EXTINF:${media.duration}, ${media.originalFilename}`)
		lines.push(`https://ptchan.org/file/${media.filename}`)
	}

	let playlist = lines.join("\n")

	baixarPlaylist(filename,playlist)
}

function baixarPlaylist(filename:string,playlist:string)
{
	const blob = new Blob([playlist],{type:"application/mpegurl"})
	const url = window.URL.createObjectURL(blob)

	const a = document.createElement('a')
	a.href = url
	a.target = "_blank"
	a.download = filename
	a.style.display = "none"
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)

}

getFio().then((fio)=>{
	getMedia(fio).then((files)=>{
		createPlaylist(`${fio.board}-${fio.postId}.m3u`,files)
	})
})