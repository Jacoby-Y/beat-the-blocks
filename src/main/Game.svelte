<script>
	import { onMount } from "svelte";
	import { timer, job_m } from "../game.js";
	import draw from "../utils/draw.js";

	// job_m.add(()=>{
	// 	console.log("Job!");
	// }, 1);

	//#region | Canvas
	/** <main> holding all html of the game */
	let main;
	/** @type {HTMLCanvasElement}*/
	let canvas;
	/** @type {CanvasRenderingContext2D}*/
	let ctx;
	/** Causes main_loop to not run if true */
	let pause = false;
	/** If paused is true: then it runs main_loop once and goes back to being paused */
	let step = false;
	/** Background color of the canvas */
	const background_color = "#3e5f3c";
	/** Width and height of canvas */
	let w, h; 
	//#endregion
	const main_loop = (v)=>{
		ctx.fillStyle = background_color;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "white";
		ctx.fillRect(10, 10, 10, 10);

		draw.rect(w/2-10, h/2-20, 20, 20, "orange");

		bullet_m.update();

		tower_m.draw();
	}
	onMount(()=>{
		ctx = canvas.getContext("2d");
		draw.set_ctx(ctx);
		timer.subscribe((v)=>{ main_loop(v); });
		console.log(canvas.width);
		canvas.width = main.clientWidth;
		canvas.height = main.clientHeight;
		[w, h] = [canvas.width, canvas.height];
		tower_m.set_pos("burst", 1);

		canvas.onmouseleave = ()=>{
			mouse.hover = false;
		}
		canvas.onmousemove = (e)=>{
			[ mouse.x, mouse.y ] = [ e.layerX, e.layerY ];
		}
		canvas.onmousedown = (e)=>{
			const [ x, y ] = [ e.layerX, e.layerY ];
			tower_m.click(x, y);
		}
		document.onkeyup = ({ key })=>{
			if (key == "b") console.log(bullet_m);
		}
	});

	const tower_m = (()=>{
		const positions = [
			null,
			null,
			null,
			null,
			null,
			null,
			null,
		];
		const new_tower = {
			burst(i) {
				positions[i] = {
					x: w/(positions.length+1) * (i+1),
					y: h-w/(positions.length+1),
					angle: 0,
					can_shoot: true,
					draw() {
						this.angle = Math.atan2(mouse.y-this.y, mouse.x-this.x)+1.57;
						draw.transform(this.x, this.y, this.angle);
						const path = draw.new_path(-10,5,  0,-15,  10,5, -10,5);
						draw.path(path, "aqua");
						draw.rect(-5, 3, 10, 2, "#006666");
						draw.reset();
					},
					shoot() {
						if (!this.can_shoot) return;
						this.can_shoot = false;
						job_m.add(()=>{
							this.can_shoot = true;
						}, 30);
						bullet_m.add("burst", this);
					}
				}
			}
		};
		return {
			set_pos(tower, i) {
				if (typeof new_tower[tower] != "function") return;
				new_tower[tower](i);
			},
			draw() {
				for (let i = 0; i < positions.length; i++) {
					const tower = positions[i];
					const x = w/(positions.length+1) * (i+1);
					const y = h-w/(positions.length+1);
					if (tower == null) {
						draw.circle(x, y, 4, "#212121", false);
					} else if (tower.draw != undefined) {
						tower.draw();
					}
				}
			},
			click(x,y) {
				// console.log(positions); return;
				for (let i = 0; i < positions.length; i++) {
					const tower = positions[i];
					if (tower != null) {
						tower.shoot();
						// console.log(tower);
					}
				}
			}
		};
	})();

	const bullet_m = (()=>{
		const new_bullet = {
			burst(tower) {
				for (let i = 0; i < 6; i++) {
					job_m.add(()=>{
						const [ x, y, ang ] = [ tower.x, tower.y, tower.angle-1.57 ];
						const vx = Math.cos(ang+(Math.random()/10-0.05))*15;
						const vy = Math.sin(ang+(Math.random()/10-0.05))*15;
						bullets.push({
							x,y, ang, vx, vy, tag: "burst",
							ticks: 60,
						});
					}, 2*i);
				}
			}
		};
		const bullets = [];

		const update_bullet = {
			burst(b) {
				if (b.ticks <= 0) return true;
				draw.transform(b.x, b.y, b.ang);
				draw.rect(5, -1, 5, 2, "black");
				draw.reset();
				b.x += b.vx;
				b.y += b.vy;
				b.ticks--;
				return false;
			}
		}

		return {
			add(key, tower) {
				if (new_bullet[key] == undefined) return;
				new_bullet[key](tower);
			},
			update() {
				for (let i = bullets.length-1; i >= 0; i--) {
					const b = bullets[i];
					const destroy = update_bullet[b.tag](b);
					if (destroy) bullets.splice(i, 1);
				}
			},
			get bullets() { return bullets },
		}
	})();

	const mouse = {
		x: -1, y: -1,
		hover: false,
	}

</script>

<main bind:this={main}>
	<canvas bind:this={canvas}></canvas>
</main>

<style>
	main {
		position: relative;
	}
	canvas {
		position: absolute;
		left: 0; top: 0;
		width: 100%;
		height: 100%;
	}
</style>