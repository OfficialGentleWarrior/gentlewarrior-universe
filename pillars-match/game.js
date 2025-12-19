document.addEventListener("DOMContentLoaded", () => {

  const PILLARS = ["aurelion","gaialune","ignara","solyndra","umbrath","zeratheon"];
  const GRID_SIZE = 7;
  const gridEl = document.querySelector(".grid");

  let tiles = [];
  let selected = null;
  let busy = false;

  // non-blocking preload
  PILLARS.forEach(p => { const i = new Image(); i.src = `../assets/pillars/${p}.png`; });

  function rand() { return PILLARS[Math.floor(Math.random()*PILLARS.length)]; }
  function idx(r,c){ return r*GRID_SIZE+c; }
  function adj(a,b){
    const ar=Math.floor(a/GRID_SIZE), ac=a%GRID_SIZE;
    const br=Math.floor(b/GRID_SIZE), bc=b%GRID_SIZE;
    return Math.abs(ar-br)+Math.abs(ac-bc)===1;
  }

  function create(){
    gridEl.innerHTML="";
    tiles=[];
    for(let i=0;i<GRID_SIZE*GRID_SIZE;i++){
      const img=document.createElement("img");
      const p=rand();
      img.className="tile";
      img.dataset.i=i;
      img.dataset.p=p;
      img.src=`../assets/pillars/${p}.png`;
      img.draggable=false;
      img.addEventListener("click",()=>tap(img));
      tiles.push(img);
      gridEl.appendChild(img);
    }
  }

  function tap(t){
    if(busy) return;
    if(!selected){ selected=t; t.classList.add("selected"); return; }
    if(t===selected){ t.classList.remove("selected"); selected=null; return; }

    const i1=+selected.dataset.i, i2=+t.dataset.i;
    if(!adj(i1,i2)){ selected.classList.remove("selected"); selected=null; return; }

    busy=true;
    animateSwap(selected,t,()=>{
      swap(selected,t);
      const m=find();
      if(m.length===0){
        setTimeout(()=>animateSwap(t,selected,()=>{
          swap(t,selected);
          busy=false;
        }),120);
      }else{
        resolve();
      }
    });
    selected.classList.remove("selected");
    selected=null;
  }

  function animateSwap(a,b,done){
    a.classList.add("swapping");
    b.classList.add("swapping");
    setTimeout(()=>{
      a.classList.remove("swapping");
      b.classList.remove("swapping");
      done();
    },120);
  }

  function swap(a,b){
    const p1=a.dataset.p, p2=b.dataset.p;
    a.dataset.p=p2; b.dataset.p=p1;
    a.src=`../assets/pillars/${p2}.png`;
    b.src=`../assets/pillars/${p1}.png`;
  }

  function find(){
    const s=new Set();
    // H
    for(let r=0;r<GRID_SIZE;r++){
      let c=1;
      for(let x=1;x<=GRID_SIZE;x++){
        const cur = x<GRID_SIZE ? tiles[idx(r,x)].dataset.p : null;
        const prev= tiles[idx(r,x-1)].dataset.p;
        if(cur===prev) c++;
        else{ if(c>=3) for(let k=0;k<c;k++) s.add(idx(r,x-1-k)); c=1; }
      }
    }
    // V
    for(let c=0;c<GRID_SIZE;c++){
      let r=1;
      for(let y=1;y<=GRID_SIZE;y++){
        const cur = y<GRID_SIZE ? tiles[idx(y,c)].dataset.p : null;
        const prev= tiles[idx(y-1,c)].dataset.p;
        if(cur===prev) r++;
        else{ if(r>=3) for(let k=0;k<r;k++) s.add(idx(y-1-k,c)); r=1; }
      }
    }
    return [...s];
  }

  function clear(list){
    list.forEach(i=>{ tiles[i].dataset.p=""; tiles[i].style.opacity="0"; });
  }

  function gravity(){
    for(let c=0;c<GRID_SIZE;c++){
      const stack=[];
      for(let r=GRID_SIZE-1;r>=0;r--){
        const t=tiles[idx(r,c)];
        if(t.dataset.p) stack.push(t.dataset.p);
      }
      for(let r=GRID_SIZE-1;r>=0;r--){
        const t=tiles[idx(r,c)];
        const p=stack.shift()||rand();
        t.dataset.p=p;
        t.src=`../assets/pillars/${p}.png`;
        t.style.opacity="1";
      }
    }
  }

  function resolve(){
    const m=find();
    if(m.length===0){ busy=false; return; }
    clear(m);
    setTimeout(()=>{ gravity(); setTimeout(resolve,120); },120);
  }

  create();
});
