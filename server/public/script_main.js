const bookmark = document.getElementById('bookmark')

let movieArr=[]

window.onload = function (){

    searchMovie()
    renderMovie()

    movieArr=[]
};

const cookies=document.cookie.split('=')[1]; // 쿠키 존재
document.getElementById("loginbtn").addEventListener("click", openForm);
document.getElementById("registerbtn").addEventListener("click", openForm);
document.getElementById("close_button").addEventListener("click", closeForm);

function searchMovie(){
    var userData = {'cookie': cookies};
    $.ajax({
        //////content type 명시하지 않음
              type: "post",
              url : "http://localhost:8000/select/all",
              async: false,
              data : userData,
              success : function (data){
                console.log(data)
                $.each(data, function(i, item) {
                    const movieObj ={
                        videoId : item.video_id,		 // 비디오 아이디	
                        videoTitle : item.video_title,      // 비디오 이름
                        channelTitle : item.channel  //채널명
                    }
                    movieArr.push(movieObj)
                    // dbArr.push(item)
                    
                });
              },
              error : function(e){
              }
    })
    
    
}

function renderMovie(){
    
    const movieHtml = movieArr.map((movie) => {
        return `
            <div class="movieCard" id=${movie.videoId}>
                <iframe width="400" height="250" src="https://www.youtube.com/embed/${movie.videoId}" 
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; 
                clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen; style="float:left; margin-right:10px;""></iframe>
                <div class="info" style="float:left">
                    <div class="videoTitle">${movie.videoTitle}</div>
                    <div class="channelTitle">${movie.channelTitle}</div>
                </div>
                <div class="star" style="float:right bottom: 0;">
                    <img class = "fill" src="./img/star.png" data-action="unbookmark"></img>
                </div>
            </div>
            `
    }).join('');
    bookmark.innerHTML = movieHtml

}

bookmark.addEventListener('click',(e) => {
    const target = e.target;
    const selectedParentElement = target.parentNode.parentNode;
    if (selectedParentElement.className == "movieCard"){
        const selectedParentId = selectedParentElement.id;

        const action = target.dataset.action
        
        action == 'bookmark' && addBookmark(selectedParentElement)
        action == 'unbookmark' && deleteBookmark(selectedParentElement)
    }else{
        return
    }
})

function deleteBookmark(selectedParentElement){
    const blink_star = selectedParentElement.querySelector(".blink")
    const fill_star = selectedParentElement.querySelector(".fill")
    const videoId = selectedParentElement.id
    const videoTitle = selectedParentElement.querySelector('.videoTitle').innerHTML
    const channelTitle = selectedParentElement.querySelector('.channelTitle').innerHTML
    
    var youtubeData = {'videoId':videoId,'videoTitle':videoTitle,'channelTitle':channelTitle, 'cookie': cookies};
    $.ajax({
        //////content type 명시하지 않음
              type: "post",
              url : "http://localhost:8000/delete",
              data : youtubeData,
              success : function (data){
                console.log(data);
              },
              error : function(e){
              }
      })

    searchMovie()
    renderMovie()

    movieArr=[]
}

function openForm() {
    console.log(document.getElementById('LoginForm'))
    document.getElementById('LoginForm').style.display = "block";
}
  
function closeForm() {
    document.getElementById('LoginForm').style.display = "none";
}