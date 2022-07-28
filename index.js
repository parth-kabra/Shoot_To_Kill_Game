/*
                                                     __  __                        _                     
                                                    |  \/  |   ___   _ __   _ __  (_)   __ _   _ __ ___  
                                                    | |\/| |  / _ \ | '__| | '__| | |  / _` | | '_ ` _ \ 
                                                    | |  | | |  __/ | |    | |    | | | (_| | | | | | | |
                                                    |_|  |_|  \___| |_|    |_|    |_|  \__,_| |_| |_| |_|

                                                    __        __         _             _                 
                                                    \ \      / /   ___  | |__    ___  | |_    ___   _ __ 
                                                     \ \ /\ / /   / _ \ | '_ \  / __| | __|  / _ \ | '__|
                                                      \ V  V /   |  __/ | |_) | \__ \ | |_  |  __/ | |   
                                                       \_/\_/     \___| |_.__/  |___/  \__|  \___| |_|   
*/


const canvas=document.querySelector('canvas')
canvas.width=innerWidth
canvas.height=innerHeight
const c=canvas.getContext('2d')
const scoreEl=document.querySelector('#scoreEl')
const startGameBtn=document.querySelector("#startGameBtn")
const modalEl=document.querySelector("#modalEl")
const bigScoreEl=document.querySelector("#bigScoreEl")
class Player{
	constructor(x,y,radius,color){
		this.x=x
		this.y=y
		this.radius=radius
		this.color=color
	}
	draw(){
		c.beginPath()
		c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
		c.fillStyle=this.color
		c.fill()
	}
}
class Projectile{
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius
		this.color=color
		this.velocity=velocity
	}
	draw(){
		c.beginPath()
		c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
		c.fillStyle=this.color
		c.fill()
	}
	update(){
		this.draw()
		this.x=this.x+this.velocity.x
		this.y=this.y+this.velocity.y
	}
}
class Enemy{
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius
		this.color=color
		this.velocity=velocity
	}
	draw(){
		c.beginPath()
		c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
		c.fillStyle=this.color
		c.fill()
	}
	update(){
		this.draw()
		this.x=this.x+this.velocity.x
		this.y=this.y+this.velocity.y
	}
}
const friction=0.99
class Particle{
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius
		this.color=color
		this.velocity=velocity
		this.alpha=1
	}
	draw(){
		c.save()
		c.globalAlpha=this.alpha
		c.beginPath()
		c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
		c.fillStyle=this.color
		c.fill()
		c.restore()
	}
	update(){
		this.draw()
		this.velocity.x *=friction
		this.velocity.y*=friction
		this.x=this.x+this.velocity.x
		this.y=this.y+this.velocity.y
		this.alpha-=0.01
	}
}
const x=canvas.width/2
const y=canvas.height/2
const projectile=new Projectile(canvas.width/2,canvas.height/2,5,'red',{x:1,y:1})
let player=new Player(x,y,14,'white')
let projectiles=[]
let enemies=[]
let particles=[]
function init(){
	player=new Player(x,y,14,'white')
	projectiles=[]
	enemies=[]
	particles=[]
}
function spawnEnemies(){
	setInterval(()=>{
		const radius=Math.random() * (30-4)+4
		let x;
		let y;
		if(Math.random() < 0.5){
			x=Math.random() < 0.5 ? 0-radius : canvas.width + radius
			y=Math.random() * canvas.height
			//y=Math.random() < 0.5 ? 0-radius : canvas.height + radius
		}else{
			x=Math.random() * canvas.width
			//y=Math.random() * canvas.height
			y=Math.random() < 0.5 ? 0-radius : canvas.height + radius

		}
		const color=`hsl(${Math.random() * 360},50%,50%`
		const angle=Math.atan2(canvas.height/2-y,canvas.width/2-x)
		const velocity={
			x:Math.cos(angle),
			y:Math.sin(angle)
		}
		enemies.push(new Enemy(x,y,radius,color,velocity))
	},1000)
}
let animationId;
let score=0;
function animate(){
	animationId=requestAnimationFrame(animate)
	c.fillStyle='rgba(0,0,0,0.1)'
	c.fillRect(0,0,canvas.width,canvas.height)
	player.draw()
	particles.forEach((particle,index)=>{
		if(particle.alpha <=0){
			particles.splice(index,1)
		}else{
			particle.update()
		}
		//particle.update()
	});
	projectiles.forEach((projectile,index)=>{
		projectile.update()

		if(projectile.x+projectile.radius < 0 || projectile.x-projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y-projectile.radius > canvas.height){
			setTimeout(()=>{
				//enemies.splice(index,1)
				projectiles.splice(index,1)
			},0)	
		}
	})

	enemies.forEach((enemy,index)=>{
		enemy.update()
		const dist = Math.hypot(player.x-enemy.x,player.y-enemy.y)
		if(dist -enemy.radius-player.radius < 1){
			cancelAnimationFrame(animationId)
			score=0;
			modalEl.style.display='flex'
			//bigScoreEl.innerHTML=scoreEl
		}
		projectiles.forEach((projectile,projectileindex) => {
			const dist = Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)
			if(dist -enemy.radius-projectile.radius < 1){
				for(let i=0;i<enemy.radius;i++){
					particles.push(new Particle(projectile.x,projectile.y,Math.random() *2,enemy.color,{x:(Math.random()-0.5)*(Math.random()*8),y:(Math.random()-0.5)*(Math.random()*8)}))
				}
				if(enemy.radius-10 > 5){
					//enemy.radius-=10;
					score+=100
					scoreEl.innerHTML = score
					gsap.to(enemy,{radius : enemy.radius-10})
					setTimeout(()=>{
						//enemies.splice(index,1)
						projectiles.splice(projectileindex,1)
					},0)					
				}
				else{
					score+=250
					scoreEl.innerHTML = score
					setTimeout(()=>{
						enemies.splice(index,1)
						projectiles.splice(projectileindex,1)
					},0)
				}
			}
		});
	})
}
addEventListener('click',(event)=>{
	const angle=Math.atan2(event.clientY-canvas.height/2,event.clientX-canvas.width/2)
	const velocity={
		x:Math.cos(angle)*5,
		y:Math.sin(angle) *5
	}
	projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity))
})
function CreateNewGame(){
	modalEl.style.display = "none"
	init()
	animate()
	spawnEnemies()
}
CreateNewGame();