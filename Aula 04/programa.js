/* Variávei globais */

let canvas,
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    vertexShader,
    fragmentShader,
    shaderProgram,
    data,
    dataFundo,
    positionAttr,
    positionBuffer,
    width,
    height,
    aspectUniform,
    aspect,
    x = 0,
    y = 0;

function resize(){
    if(!gl) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    gl.viewport(0, 0, width, height);
    aspect = width / height;
    aspectUniform = gl.getUniformLocation(shaderProgram, "aspect");
    gl.uniform1f(aspectUniform, aspect);
}


function getCanvas(){
    return document.querySelector("canvas");
}

function getGLContext(canvas) {
    let gl = canvas.getContext("webgl");
    return gl;
}

function compileShader(source, type, gl){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.error("ERRO NA COMPILAÇÃO", gl.getShaderInfoLog(shader));
    return shader;
}

function linkProgram(vertexShader, fragmentShader, gl){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.error("ERRO NA LINKAGEM");
    return program;
}

function getData() {
    let nave = [
            (0.001 + x), (0.1 + y),
            (0.1 + x), (-0.1 + y),
            (-0.1 + x), (-0.1 + y),
        ];

    
    return { "points" : new Float32Array(nave) };
}

function getDataFundo() {
    let fundo = [
            0.5, 0.5,
            0.5, -0.5,
            -0.5, -0.5,
        
            -0.5, -0.5,
            -0.5, 0.5,
            0.5, 0.5,
        ];
    
    return { "points" : new Float32Array(fundo)};
}

async function main() {
// 1 - Carregar tela de desenho
    canvas = getCanvas();

// 2 - Carregar o contexto (API) WebGL
    gl = getGLContext(canvas);

// 3 - Ler os arquivos de shader
    vertexShaderSource = await fetch("vertex.glsl").then(r => r.text());
    console.log("VERTEX", vertexShaderSource);

    fragmentShaderSource = await fetch("fragment.glsl").then(r => r.text());
    console.log("FRAGMENT", fragmentShaderSource);

// 4 - Compilar arquivos de shader
    vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER, gl);
    fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl);

// 5 - Linkar o programa de shader
    shaderProgram = linkProgram(vertexShader, fragmentShader, gl);
    gl.useProgram(shaderProgram);

// 6 - Criar dados de parâmetro
    data = getData();
    dataFundo = getDataFundo();

// 7 - Transferir os dados para GPU
    positionAttr = gl.getAttribLocation(shaderProgram, "position");
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttr);
    gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);

// 7.1 - ASPECT UNIFORM
    resize();
    window.addEventListener("resize", resize);

// 8 - Chamar o loop de redesenho
    render();
    
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.POINTS
    // gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP
    // gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN 
    gl.drawArrays(gl.TRIANGLES, 0, data.points.length / 2);
    window.requestAnimationFrame(render);
}

// Move a nave
window.addEventListener('keydown', 
function (e) {
    // Pega códigos da tecla pressionada
    let keyPressedCode = e.keyCode || e.which;
    // Cima
    if (keyPressedCode == 38) {
        y = y + 0.01;    
    } 
    // Direita
    else if (keyPressedCode == 39){
        x = x + 0.01;    
    }
    // Baixo
    else if (keyPressedCode == 40){
        y = y - 0.01;
    }
    // Esquerda
    else if (keyPressedCode == 37) {
        x = x - 0.01;
    }
    data = getData(x, y);
    gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
    }
);

window.addEventListener("load", main);