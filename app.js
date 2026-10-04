const movies=[
 {title:"Your First Original",meta:"Original • Coming Soon"},
 {title:"Bihar Stories",meta:"Regional • Coming Soon"},
 {title:"Independent Film",meta:"Licensed • Coming Soon"},
 {title:"SS PLAY Premiere",meta:"Exclusive • Coming Soon"}
];
const series=[
 {title:"City Stories",meta:"Series • Coming Soon"},
 {title:"The Field",meta:"Drama • Coming Soon"},
 {title:"Bihar Diaries",meta:"Documentary • Coming Soon"},
 {title:"New Voices",meta:"Original • Coming Soon"}
];
function render(list,id){
 const el=document.getElementById(id);
 el.innerHTML=list.map((x,i)=>`<article class="card" data-title="${x.title}">
   <div class="poster"><span>SS</span> PLAY</div>
   <div class="card-body"><b>${x.title}</b><span class="muted">${x.meta}</span></div>
 </article>`).join("");
 el.querySelectorAll(".card").forEach(c=>c.addEventListener("click",()=>openPlayer(c.dataset.title)));
}
function openPlayer(title){
 document.getElementById("modalTitle").textContent=title;
 document.getElementById("playerModal").classList.remove("hidden");
}
function closeModals(){document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))}
render(movies,"movieCards");render(series,"seriesCards");
document.querySelectorAll("[data-play]").forEach(b=>b.addEventListener("click",()=>openPlayer("SS PLAY Featured Content")));
document.getElementById("loginBtn").addEventListener("click",()=>document.getElementById("loginModal").classList.remove("hidden"));
document.getElementById("premiumBtn").addEventListener("click",()=>alert("Premium payments will be connected in Phase 2."));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModals()}));
document.getElementById("year").textContent=new Date().getFullYear();
