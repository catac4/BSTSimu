
let mainButton = document.getElementById("findButton");
let addButton = document.getElementById("addButton");
let deleteButton = document.getElementById("deleteButton")
const width = 10000;
const height = 10000;
let radius = 30;
let len = 2 * radius * Math.PI;
let txSize = radius;
let aux =(radius*Math.SQRT2)/2;
let speed = 350;
let arr = [];

let canvas = SVG().addTo('#map').size(width,height);

const t = new SVG.Timeline().persist(true)
t.on('finished', (e) => {
  setTimeout(()=>{
    mainButton.disabled = false;
  },10);
})

function createCircle(nodo,timeline){
  let circle = canvas.circle(2*radius).move(width/2 - radius + 2*radius*nodo.x,50 + 2*radius*nodo.y);
  circle.fill('none').stroke({
    color: '#f06',
    width: 6,
    dasharray: [len],
    dashoffset: len,
    linecap: 'round'
  }).attr({'node' : nodo.index}).timeline(timeline);
  
  if(nodo.state == 'l'){
    circle.transform({rotate: 315,scaleY: -1})
  }else{
    circle.transform({rotate: 225});
  }
  
  return circle;
}

function createLine(nodo, timeline, setColor = "#f06"){
  let xprev = nodo.parent.x;
  let yprev = nodo.parent.y;
  let fromNode,toNode;
  
  if(xprev < nodo.x){
    fromNode = [(width/2 - radius) + radius*(2*xprev+1) + aux,50 + radius*(2*yprev + 1) + aux];
    toNode = [width/2 - radius + radius*(2*nodo.x+1) - aux,50 + radius*(2*nodo.y+1) -aux];
  }else{
    fromNode = [(width/2) - radius + radius*(2*xprev+1) - aux,50 + radius*(2*yprev + 1) + aux];
    toNode = [width/2 - radius + radius*(2*nodo.x+1) + aux,50 + radius*(2*nodo.y+1) - aux];
  }
  let ln = canvas.line().plot([fromNode,fromNode]).stroke(
    { color: setColor, width: 6, linecap: 'round',opacity: 0 }
  ).timeline(timeline).remember({
    from : fromNode,
    to : toNode
  });

  return ln;
}

function createValue(nodo, timeline){
  let txt = canvas.text(nodo.value.toString()).font({
    family: 'Helvetica', size: txSize, opacity: 0
  })
  txt.move(width/2 + 2*radius*nodo.x -  (txt.text().length)*(0.5)*(txt.length()/(txt.text().length)),50 + radius/2.5 + 2*radius*nodo.y).timeline(timeline);
  
  return txt;
}

function updateNode(nodo){
  if(nodo != null){console.log(nodo.value);

    nodo.circle.animate(speed,0,"now").move(width/2 - radius + 2*radius*nodo.x,50 + 2*radius*nodo.y);
    nodo.text.animate(speed,0,"now").move(width/2 + 2*radius*nodo.x  -  (nodo.text.text().length)*(0.5)*(nodo.text.length()/(nodo.text.text().length)),50 + radius/2.5 + 2*radius*nodo.y);
    if(nodo.state == 'l'){
      nodo.line.remember("from",[(width/2 - radius) + radius*(2*nodo.parent.x+1) - aux,50 + radius*(2*nodo.parent.y + 1) + aux]);
      nodo.line.remember("to",[width/2 - radius + radius*(2*nodo.x+1) + aux,50 + radius*(2*nodo.y+1) - aux])
    }else{
      nodo.line.remember("from",[(width/2 - radius ) + radius*(2*nodo.parent.x+1) + aux,50 + radius*(2*nodo.parent.y + 1) + aux]);
      nodo.line.remember("to",[width/2 - radius + radius*(2*nodo.x+1) - aux,50 + radius*(2*nodo.y+1) - aux])
    }
    nodo.line.animate(speed,0,"now").plot([nodo.line.remember("from"),nodo.line.remember("to")]);
  }
}

class Node{
  constructor(value){
    this.value  = value;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.state = 'o';
    this.x = 0;
    this.y = 0;
    this.circle = null;
    this.text = null;
    this.line = null;
  }
}

class Tree{
  constructor(){
    this.root = null;
    this.lsAux = new SVG.List();    
    this.treeTL = null;
    this.nodeList = new SVG.List();
    this.textList = new SVG.List();
    this.lineList = new SVG.List();
  }
  
  insert(nodo,index){
    let time = this.search(nodo.value,true);
    if(time != -1){
      setTimeout(()=>{
        if(this.root == null){
          this.root = nodo;
          let newCircle = createCircle(nodo,t);
          this.nodeList.push(newCircle);
          newCircle.animate(speed,0,'now').ease('<>').stroke({dashoffset: 0});
          
          let newText = createValue(nodo,t);
          this.textList.push(newText);
          newText.animate(speed/2,0,'after').ease('<>').font({opacity: 1});
        }else{
          this.insertNode(nodo,this.root,index,0);
        }
      },time);
    }

  }

  search(value){
    this.treeTL = new SVG.Timeline();
    this.treeTL.on('finished', (e) => {
        this.lsAux.remove();
        this.lsAux = new SVG.List();
        mainButton.disabled = false;
    },speed)
    return this.searchNode(value,true);
  }

  searchNode(value,origin,nodo = this.root,time = 0){
    if(nodo != null){
      let colorSet = "#2157d3";
      if(!origin){
        let ln = createLine(nodo,this.treeTL,colorSet);
        this.lsAux.push(ln);
        ln.animate(0,speed + speed*2*(time-1),'absolute').stroke({opacity:1});
        ln.animate(speed,speed + speed*2*(time-1),'absolute').ease('<>').plot([ln.remember("from"),ln.remember("to")]);
      }

      let circle = createCircle(nodo,this.treeTL);
      circle.stroke({color: colorSet});
      circle.animate(speed,speed*2*time,'absolute').ease('<>').stroke({dashoffset: 0});
      this.lsAux.push(circle);

      if(value == nodo.value){
        circle.stroke({color: "#167c06"})
        this.lsAux.animate(speed,2*(time+1)*speed,'absolute').opacity(0);
        return -1;
      }else if(value > nodo.value){
        return this.searchNode(value,false,nodo.right,time+=1);
      }else{
        return this.searchNode(value,false,nodo.left,time+=1);
      }

    }else{
      this.lsAux.animate(speed,2*(time)*speed,'absolute').opacity(0);
      return 2*(time)*speed + speed/2;
    }
  }

  insertNode(nodo,raiz,index = 0,addx){
    nodo.y+=1;
    if(nodo.value > raiz.value){
      if(raiz.state == 'l'){
        addx-=1;
      }
      raiz.x += addx;
      if(raiz.circle != null){
       updateNode(raiz);
      }

      if(raiz.right == null){
        raiz.right = nodo;
        nodo.parent = raiz;
        nodo.state = 'r';
        nodo.index = index;
        nodo.x = raiz.x + 1;

        let ln = createLine(nodo,t);
        this.lineList.push(ln);
        ln.animate(1,0,'after').stroke({opacity:1});
        ln.animate(speed,0,'after').ease('<>').plot([ln.remember("from"),ln.remember("to")]);
        nodo.line = ln;

        let newCircle = createCircle(nodo,t);
        this.nodeList.push(newCircle);
        newCircle.animate(speed,0,'after').ease('<>').stroke({dashoffset: 0});
        newCircle.animate(1,0,"after").rotate(135)
        nodo.circle = newCircle;

        let newText = createValue(nodo,t);
        this.textList.push(newText);
        nodo.text = newText;
        newText.animate(speed/2,0,'after').ease('<>').font({opacity: 1});

        this.updateNode(raiz.left,addx);
      }else{ 
        this.insertNode(nodo,raiz.right,index,addx);
        this.updateNode(raiz.left,addx);
      }
    }else{
      if(raiz.state == 'r'){
        addx+=1;
      }
      raiz.x+=addx;

      if(raiz.circle != null){
        updateNode(raiz);
      }

      if(raiz.left == null){
        raiz.left = nodo;
        nodo.parent = raiz;
        nodo.state = 'l';
        nodo.index = index;
        nodo.x = raiz.x - 1;

        let ln = createLine(nodo,t);
        this.lineList.push(ln);
        ln.animate(1,0,'after').stroke({opacity:1});
        ln.animate(speed,0,'after').ease('<>').plot([ln.remember("from"),ln.remember("to")]);
        nodo.line = ln;

        let newCircle = createCircle(nodo,t);
        this.nodeList.push(newCircle);
        newCircle.animate(speed,0,'after').ease('<>').stroke({dashoffset: 0});
        newCircle.animate(1,0,"after").transform({rotate: 0, scaleY:1});
        nodo.circle = newCircle;

        let newText = createValue(nodo,t);
        this.textList.push(newText);
        newText.animate(speed/2,0,'after').ease('<>').font({opacity: 1});
        nodo.text = newText;
        this.updateNode(raiz.right,addx);

      }else{ 
        this.insertNode(nodo,raiz.left,index,addx);
        this.updateNode(raiz.right,addx);
      }
    }
  }
  
  updateNode(raiz,addx,addy = 0){
    if(raiz != null && addx != 0){      
      raiz.x += addx;
      raiz.y += addy;
      updateNode(raiz);
      
      this.updateNode(raiz.left,addx,addy);
      this.updateNode(raiz.right,addx,addy);
    }
  }

  updateNodeDown(value,nodo = this.root,addx = 0){
    if(nodo == null && nodo.value == value){
      if(nodo.parent != null){
         if(nodo.parent.state == "l"){
          if(nodo.state == 'l'){
            addx-=1;
           }else{
            addx+=1;
          }
         }else{
          if(nodo.state == 'l'){
            addx+=1;
           }else{
            addx-=1;
          }
         }
          
          nodo.parent.x+=addx;
          updateNode(nodo.parent);
      }
    }else if(value > nodo.value){
      if(nodo.parent != null ){
        if(nodo.state != nodo.parent.state){
          addx+=1;
        }
        nodo.parent.x+=addx;
        updateNode(nodo.parent);
      }
      this.updateNodeDown(value,nodo.right,addx);
      this.updateNode(nodo.left,addx);
    }else{
      console.log("Izquieda1")
      if(nodo.parent != null && nodo.parent.state != 'o'){
        if(nodo.state != nodo.parent.state){
          addx-=1;
        }
        nodo.parent.x+=addx;
        updateNode(nodo.parent);
      }
      this.updateNodeDown(value,nodo.left,addx); 
      this.updateNode(nodo.right,addx);
    }
  }

  inorder(raiz = this.root){
    if(raiz != null){
      this.inorder(raiz.left);
      console.log(raiz.value);
      this.inorder(raiz.right);
    }
  }

  deleteNode(value,raiz = this.root){
    if(raiz == null){

    }
    if(value > raiz.value){
      this.deleteNode(value,raiz.right);
    }else if(value < raiz.value){
      this.deleteNode(value,raiz.left);
    }else{
      if(raiz.left == null){
        raiz.text.animate(speed,0,"now").opacity(0);
        raiz.circle.animate(1,0,"after").rotate(225);
        raiz.circle.animate(speed,0,"after").ease('<>').stroke({dashoffset: len});;
        raiz.line.animate(speed,0,"after").plot([raiz.line.remember("from"),raiz.line.remember("from")]);
        
        this.updateNode(raiz.right,-1,-1);

        this.updateNodeDown(raiz.value);
        raiz.parent.right = raiz.right;
        if(raiz.right != null){
          raiz.right.parent = raiz.parent;
        }
        raiz.right = null;

      }else if(raiz.right == null){
        raiz.text.animate(speed,0,"now").opacity(0);
        raiz.circle.animate(1,0,"after").rotate(0)
        raiz.circle.animate(speed,0,"after").ease('<>').stroke({dashoffset: len});;
        raiz.line.animate(speed,0,"after").plot([raiz.line.remember("from"),raiz.line.remember("from")]);
        
       
        this.updateNode(raiz.left,1,-1);

        this.updateNodeDown(raiz.value);
        raiz.parent.left = raiz.left;
        if(raiz.left != null){
          raiz.left.parent = raiz.parent;
        }
        raiz.left = null;

      }else{
        raiz.value = this.findNextInorder(raiz.right);
        raiz.text.text(raiz.value.toString())
        this.deleteNode(raiz.value,raiz.right);
      }
    }

  }

  findNextInorder(nodo){
    let currentNodo = _.cloneDeep(nodo);
    let val = _.cloneDeep(currentNodo.value);
    while(currentNodo.left != null){
      val = _.cloneDeep(currentNodo.left.value);
      currentNodo = _.cloneDeep(currentNodo.left);
    }
    return val;
  }

}

let tree = new Tree();

function findNode(){
  let valNode = document.getElementById("numberToSearch").value;
  tree.search(valNode);
}

function addNode(){
  let newValue = Number(document.getElementById("numberToAdd").value);
  tree.insert(new Node(newValue));
}

function deleteNode(){
  let valNode = document.getElementById("numberToDelete").value;
  tree.deleteNode(valNode);
}