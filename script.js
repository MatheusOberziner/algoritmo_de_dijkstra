// Estrutura de dados do grafo
const graph = {
  'Rio do Sul': {'Taió': 55, 'Trombudo Central': 25, 'Agrolândia': 20, 'Ituporanga': 35, 'Presidente Getúlio': 40, 'Ibirama': 45},
  'Ituporanga': {'Trombudo Central': 18, 'Pouso Redondo': 70, 'Salete': 50, 'Rio do Sul': 35, 'Laurentino': 60},
  'Ibirama': {'Witmarsum': 30, 'Dona Emma': 45, 'Rio do Sul': 45, 'Taió': 75},
  'Taió': {'Rio do Sul': 55, 'Ibirama': 75, 'Trombudo Central': 35, 'José Boiteux': 25, 'Aurora': 35},
  'Trombudo Central': {'Rio do Sul': 25, 'Braço do Trombudo': 40, 'Taió': 35, 'Ituporanga': 18},
  'Presidente Getúlio': {'Rio do Sul': 40, 'Laurentino': 50},
  'Agrolândia': {'Rio do Sul': 20, 'Pouso Redondo': 55},
  'Laurentino': {'Ituporanga': 60, 'Salete': 20, 'Presidente Getúlio': 50},
  'Pouso Redondo': {'Agrolândia': 55, 'Ituporanga': 70, 'Salete': 40},
  'Salete': {'Ituporanga': 50, 'Laurentino': 20, 'Pouso Redondo': 40},
  'Witmarsum': {'Ibirama': 30},
  'Dona Emma': {'Ibirama': 45},
  'José Boiteux': {'Taió': 25},
  'Aurora': {'Taió': 35},
  'Braço do Trombudo': {'Trombudo Central': 40}
};

// Implementação do Algoritmo de Dijkstra
function dijkstra(graph, start, end) {
  let distances = {};
  let prev = {};
  let pq = [];

  Object.keys(graph).forEach(v => {
    distances[v] = Infinity;
    prev[v] = null;
  });

  distances[start] = 0;
  pq.push({ node: start, dist: 0 });

  while (pq.length > 0) {
    let { node, dist } = pq.shift();

    if (node === end) {
      let path = [];
      let u = end;
      while (prev[u]) {
        path.push(u);
        u = prev[u];
      }
      path.push(start);
      return { path: path.reverse(), distance: distances[end] };
    }

    Object.entries(graph[node]).forEach(([neighbor, cost]) => {
      let alt = dist + cost;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        prev[neighbor] = node;
        pq.push({ node: neighbor, dist: alt });
      }
    });

    pq.sort((a, b) => a.dist - b.dist);
  }

  return { path: [], distance: Infinity };
  // return 'Nenhum caminho encontrado';
}

// Adicionar evento ao botão de encontrar caminho
document.getElementById('findPath').addEventListener('click', () => {
  let start = document.getElementById('start').value;
  let end = document.getElementById('end').value;

  let result = dijkstra(graph, start, end);

  // Exibir o resultado no HTML
  document.getElementById('result').textContent = `Caminho mais curto: ${result.path.join(' -> ')} (Distância total: ${result.distance})`;

  let totalCost = 0
  // Calcular o custo total do caminho
  for (let i = 0; i < result.path.length - 1; i++) {
    const currentCity = result.path[i]
    const nextCity = result.path[i + 1]

    const roadSegment = links.find(link =>
      (link.source === currentCity && link.target === nextCity) ||
      (link.source === nextCity && link.target === currentCity)
    )

    // Fórmula do custo: f(x) = distância * pavimentação * tráfego
    if (roadSegment) {
      const cost = roadSegment.distance * roadSegment.pavimentacao * roadSegment.trafego
      totalCost += cost
    }
  }

  // Exibir o custo total no HTML
  document.getElementById('cost').textContent = `Custo total do caminho selecionado: ${totalCost}`

  // Redefinir a aparência das arestas e vértices
  svg.selectAll('line').attr('stroke', 'black').attr('stroke-width', 1);
  svg.selectAll('circle').attr('fill', 'lightblue');

  // Destacar o caminho mais curto
  let pathNodes = result.path;

  // Destacar as arestas no caminho mais curto
  svg.selectAll('line')
    .filter(d => pathNodes.includes(d.source) && pathNodes.includes(d.target) && (pathNodes.indexOf(d.source) === pathNodes.indexOf(d.target) - 1 || pathNodes.indexOf(d.target) === pathNodes.indexOf(d.source) - 1))
    .attr('stroke', 'blue')
    .attr('stroke-width', 3);

  // Destacar os nós no caminho mais curto
  svg.selectAll('circle')
    .filter(d => pathNodes.includes(d.id))
    .attr('fill', 'orange');
});

// Variáveis de estado para o passo a passo
let stepPath = [];
let currentStep = 0;
let stepInProgress = false;
let stringCaminho = '';

// Função para executar o passo a passo
function stepByStepDijkstra() {
  if (!stepInProgress) {
    // Obter os valores de origem e destino
    let start = document.getElementById('start').value;
    let end = document.getElementById('end').value

    // Executar o Dijkstra e armazenar o caminho completo
    let result = dijkstra(graph, start, end);
    stepPath = result.path;
    currentStep = 0;
    stepInProgress = true;
    stringCaminho = `Caminho mais curto: ${result.path.join(' -> ')} (Distância total: ${result.distance})`;

    // Resetar o grafo antes de começar o passo a passo
    svg.selectAll('line').attr('stroke', 'black').attr('stroke-width', 1);
    svg.selectAll('circle').attr('fill', 'lightblue');

    // Destacar o ponto de partida
    highlightNode(stepPath[currentStep]);
    document.getElementById('result').textContent = `Iniciando no vértice: ${stepPath[currentStep]}`
    currentStep++;
  } else {
    // Continuar destacando o próximo passo no caminho
    if (currentStep < stepPath.length) {
      highlightEdge(stepPath[currentStep - 1], stepPath[currentStep]);
      highlightNode(stepPath[currentStep]);
      document.getElementById('result').textContent = `Destacando aresta: ${stepPath[currentStep - 1]} -> ${stepPath[currentStep]}`;
      currentStep++;
    } else {
      stepInProgress = false; // Finaliza o passo a passo
      document.getElementById('result').textContent = 'Caminho completo!';
      document.getElementById('result').textContent = stringCaminho;
    }
  }
}

// Função para destacar um nó (vértice)
function highlightNode(node) {
  svg.selectAll('circle')
    .filter(d => d.id === node)
    .attr('fill', 'orange');
}

// Função para destacar uma aresta (link entre dois nós)
function highlightEdge(node1, node2) {
  svg.selectAll('line')
    .filter(d => (d.source === node1 && d.target === node2) || (d.source === node2 && d.target === node1))
    .attr('stroke', 'blue')
    .attr('stroke-width', 3);
}

// Evento do botão para executar passo a passo
document.getElementById('stepByStep').addEventListener('click', stepByStepDijkstra);

// Modificar o reset para também resetar o estado do passo a passo
document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('start').selectedIndex = 0;
  document.getElementById('end').selectedIndex = 0;
  document.getElementById('result').textContent = '';
  document.getElementById('cost').textContent = '';

  svg.selectAll('line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

  svg.selectAll('circle')
    .attr('fill', 'lightblue');

  // Resetar o estado do passo a passo
  stepInProgress = false;
  stepPath = [];
  currentStep = 0;
});


// Função para resetar os selects e o caminho no grafo
document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('start').selectedIndex = 0
  document.getElementById('end').selectedIndex = 0

  document.getElementById('result').textContent = ''

  svg.selectAll('line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)

  svg.selectAll('circle')
    .attr('fill', 'lightblue')
})


// Código para desenhar o grafo (usando D3.js)
const svg = d3.select('#graph')
  .append('svg')
  .attr('width', 800)
  .attr('height', 750);

// Defina as posições dos vértices
const nodes = [
  { id: 'Ibirama', x: 250, y: 350 },
  { id: 'Rio do Sul', x: 400, y: 350 },
  { id: 'Taió', x: 400, y: 200 },
  { id: 'Ituporanga', x: 400, y: 520 },
  { id: 'Laurentino', x: 250, y: 600 },
  { id: 'Salete', x: 400, y: 700 },
  { id: 'Pouso Redondo', x: 550, y: 600 },
  { id: 'Trombudo Central', x: 550, y: 350 },
  { id: 'Braço do Trombudo', x: 700, y: 350 },
  { id: 'Aurora', x: 300, y: 50 },
  { id: 'Agrolândia', x: 500, y: 475 },
  { id: 'Presidente Getúlio', x: 300, y: 475 },
  { id: 'Dona Emma', x: 100, y: 250 },
  { id: 'Witmarsum', x: 100, y: 450 },
  { id: 'José Boiteux', x: 500, y: 50 },
];

// Conexões entre vértices (arestas)
const links = [
  { source: 'Rio do Sul', target: 'Ituporanga', distance: 35, pavimentacao: 1, trafego: 2 },
  { source: 'Rio do Sul', target: 'Ibirama', distance: 45, pavimentacao: 1.5, trafego: 3 },
  { source: 'Rio do Sul', target: 'Taió', distance: 55, pavimentacao: 2.2, trafego: 1 },
  { source: 'Rio do Sul', target: 'Trombudo Central', distance: 25, pavimentacao: 1, trafego: 3 },
  { source: 'Rio do Sul', target: 'Presidente Getúlio', distance: 40, pavimentacao: 1.5, trafego: 2 },
  { source: 'Rio do Sul', target: 'Agrolândia', distance: 20, pavimentacao: 1, trafego: 1 },
  { source: 'Ituporanga', target: 'Laurentino', distance: 60, pavimentacao: 1.5, trafego: 3 },
  { source: 'Ituporanga', target: 'Pouso Redondo', distance: 70, pavimentacao: 2.2, trafego: 2 },
  { source: 'Ituporanga', target: 'Salete', distance: 50, pavimentacao: 1, trafego: 1 },
  { source: 'Ituporanga', target: 'Trombudo Central', distance: 18, pavimentacao: 1, trafego: 1 },
  { source: 'Ibirama', target: 'Witmarsum', distance: 30, pavimentacao: 2.2, trafego: 2 },
  { source: 'Ibirama', target: 'Dona Emma', distance: 45, pavimentacao: 1, trafego: 3 },
  { source: 'Ibirama', target: 'Taió', distance: 75, pavimentacao: 1, trafego: 3 },
  { source: 'Taió', target: 'José Boiteux', distance: 25, pavimentacao: 1.5, trafego: 1 },
  { source: 'Taió', target: 'Aurora', distance: 35, pavimentacao: 2.2, trafego: 2 },
  { source: 'Taió', target: 'Trombudo Central', distance: 35, pavimentacao: 1.5, trafego: 1 },
  { source: 'Trombudo Central', target: 'Braço do Trombudo', distance: 40, pavimentacao: 1, trafego: 2 },
  { source: 'Presidente Getúlio', target: 'Laurentino', distance: 50, pavimentacao: 1.5, trafego: 3 },
  { source: 'Agrolândia', target: 'Pouso Redondo', distance: 55, pavimentacao: 2.2, trafego: 2 },
  { source: 'Salete', target: 'Pouso Redondo', distance: 40, pavimentacao: 2.2, trafego: 1 },
  { source: 'Laurentino', target: 'Salete', distance: 20, pavimentacao: 1, trafego: 1 }
];

// Desenhar os links (arestas)
svg.selectAll('line')
  .data(links)
  .enter()
  .append('line')
  .attr('x1', d => nodes.find(n => n.id === d.source).x)
  .attr('y1', d => nodes.find(n => n.id === d.source).y)
  .attr('x2', d => nodes.find(n => n.id === d.target).x)
  .attr('y2', d => nodes.find(n => n.id === d.target).y)
  .attr('stroke', 'black')
  .attr('stroke-width', 1)

// Desenhar os labels das distâncias nas arestas
svg.selectAll('text.distance')
  .data(links)
  .enter()
  .append('text')
  .attr('x', d => (nodes.find(n => n.id === d.source).x + nodes.find(n => n.id === d.target).x) / 2)
  .attr('y', d => (nodes.find(n => n.id === d.source).y + nodes.find(n => n.id === d.target).y) / 2)
  .attr('text-anchor', 'middle')
  .attr('dy', -5)  // Ajuste para posicionar o texto um pouco acima da linha
  .attr('class', 'distance')
  .text(d => d.distance)
  .attr('fill', 'black')
  .attr('font-size', '12px')
  .attr('font-weight', 'bold')

// Desenhar os vértices
svg.selectAll('circle')
  .data(nodes)
  .enter()
  .append('circle')
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .attr('r', 30)
  .attr('fill', 'lightblue')
  .attr('stroke', 'black')
  .attr('stroke-width', 1)

// Adicionar labels aos vértices
svg.selectAll('text.source')
  .data(nodes)
  .enter()
  .append('text')
  .attr('x', d => d.x)
  .attr('y', d => d.y)
  .attr('text-anchor', 'middle')
  .attr('dy', 5)
  .text(d => d.id)
  .attr('font-size', '12px')
  .attr('font-weight', 'bold')