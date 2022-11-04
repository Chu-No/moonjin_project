const searchform = document.getElementById('search_button')
const searchInput = document.getElementById('search_input')
const movieList = document.getElementById('movieList')

let movieArr=[]
let dbArr=[]
let keyword=""
//정규 표현식
const passwordRules = /^[A-Z]?(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
const cookies=document.cookie.split('=')[1]; // 쿠키 존재

document.getElementById("loginbtn").addEventListener("click", openForm);
document.getElementById("registerbtn").addEventListener("click", openForm);
document.getElementById("close_button").addEventListener("click", closeForm);

document.getElementById("RegisterActbtn").addEventListener("click", registerAction);

searchform.addEventListener('click', (e)=>{

    searchMovie()
    renderMovie()

    movieArr=[]
    dbArr=[]
})



function searchMovie(){
    let apikey = "AIzaSyAQH0La7SnILjFaq0-1_q58_ymTCS_uG2Y";
    let keyword = searchInput.value; //$('#search-input').val();
    
    // if (searchQuery == '') {
    //     alert('검색어를 입력해주세요!');
    //     $('#search-input').focus();
    //     return;
    // }
    $.ajax({
        
        url:'https://www.googleapis.com/youtube/v3/search',
        type:'get',
        dataType:'json',
        async: false,
        data:{part:'snippet',key:apikey,q:keyword, maxResults:20,type:'video',videoEmbeddable:'true'},
        success:function (data){
             $.each(data.items, function(i, item) {
                const movieObj ={
                    videoId : item.id.videoId,		 // 비디오 아이디	
                    videoTitle : item.snippet.title,      // 비디오 이름
                    channelTitle : item.snippet.channelTitle  //채널명
                }
                movieArr.push(movieObj)
                
            });
        }
    });
    
    
}

function renderMovie(){
    let keyword = searchInput.value;
    var search_keyword = {'keyword':keyword , 'cookie': cookies}
    $.ajax({
        //////content type 명시하지 않음
              type: "get",
              url : "http://localhost:8000/select/video_title",
              async: false,
              data : search_keyword,
              success : function (data){
                console.log(data)
                $.each(data, function(i, item) {
                    console.log(item.video_id)
                    dbArr.push(item.video_id)
                    
                });
              },
              error : function(e){
              }
    })

    isBookMark(movieArr)

}

function isBookMark(movieArr){
    const movieHtml = movieArr.map((movie) => {
        if (dbArr.includes(movie.videoId) && !(cookies)){
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
                    <img class = "blink" src="./img/blink_star.png" data-action="bookmark" style=display:none;></img>
                    <img class = "fill" src="./img/star.png" data-action="unbookmark"></img>
                </div>
            </div>
            `
        }else{
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
                    <img class = "blink" src="./img/blink_star.png" data-action="bookmark"></img>
                    <img class = "fill" src="./img/star.png" data-action="unbookmark" style=display:none;></img>
                </div>
            </div>
            `
        }
    }).join('');
    movieList.innerHTML = movieHtml
}

movieList.addEventListener('click',(e) => {
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

function addBookmark(selectedParentElement){
    const blink_star = selectedParentElement.querySelector(".blink")
    const fill_star = selectedParentElement.querySelector(".fill")
    const videoId = selectedParentElement.id
    const videoTitle = selectedParentElement.querySelector('.videoTitle').innerHTML
    const channelTitle = selectedParentElement.querySelector('.channelTitle').innerHTML
    
    var youtubeData = {'videoId':videoId,'videoTitle':videoTitle,'channelTitle':channelTitle, 'cookie': cookies};
    $.ajax({
        //////content type 명시하지 않음
              type: "post",
              url : "http://localhost:8000/insert",
              data : youtubeData,
              success : function (data){
                console.log(data);
              },
              error : function(e){
              }
      })
    console.log(youtubeData)
    
    blink_star.style.display = 'none'
    fill_star.style.display = 'inline-block'
}

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
    fill_star.style.display = 'none'
    blink_star.style.display = 'inline-block'
}

// 로그인 팝업
function openForm() {
    console.log(document.getElementById('LoginForm'))
    document.getElementById('LoginForm').style.display = "block";
}
  
function closeForm() {
    document.getElementById('LoginForm').style.display = "none";
}

function registerAction(){
    var email = $('#idInput').val()
    var password = $('#passwordInput').val()
    console.log(password)
    console.log(passwordRules.test(password));
    if(email.length==0||password.length==0){alert('아이디 혹은 비밀번호가 입력되지 않았습니다');}
    else if(!passwordRules.test(password)){alert('비밀번호 조건이 틀렸습니다');}
    else{
        var registerData = {'Id':email,'Password':password};
        $.ajax({
            //////content type 명시하지 않음
                  type: "post",
                  url : "http://localhost:8000/user/register",
                  data : registerData,
                  success : function (data){
                    if (data == "성공"){
                        alert('회원가입이 완료되었습니다');
                    }
                    else if (data == "중복ID"){
                        alert('중복된 아이디입니다');
                    }
                    
                  },
                  error : function(e){
                    alert('회원가입이 실패하였습니다');
                  }
        })
    }

    
}