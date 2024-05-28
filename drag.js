var map = document.getElementById('map');
var vp = document.getElementById('viewport');
map.onmousedown = startDrag;
function startDrag (e)
{
	var startX = e.clientX;
  var startY = e.clientY;
  var offsetX = this.offsetLeft;
  var offsetY = this.offsetTop;
  this.onmousemove = function (e2){
  	var newX = e2.clientX-startX;
    var newY = e2.clientY-startY;
    var calcX = offsetX + newX;
    var calcY = offsetY + newY;  
    this.style.left = calcX + 'px';
    this.style.top = calcY + 'px';   
  }
  this.onmouseup = function (){
    this.onmouseup = "";
    this.onmousemove = "";
  }
}
