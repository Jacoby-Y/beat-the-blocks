<script>
	import { onMount } from "svelte";
	import { timer } from "../game.js";
	import draw from "../utils/draw.js";

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
		const set_hash = {
			burst(i) {
				positions[i] = {
					i,
					x: w/(positions.length+1) * (i+1),
					y: h-w/(positions.length+1),
					draw() {
						draw.transform(this.x, this.y, 0.3);
						const path = draw.new_path(-10,5,  0,-15,  10,5, -10,5);
						draw.path(path, "aqua");
						draw.reset();
					}
				}
			}
		};
		return {
			set_pos(tower, i) {
				if (typeof set_hash[tower] != "function") return;
				set_hash[tower](i);
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
			}
		};
	})();

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