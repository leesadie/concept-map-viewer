function renderConceptMap(container, data, options={}) {
    const { title = "Concept Map" } = options;

    const nodes = data.nodes;
    const links = data.links;

    const width = options.width || window.innerWidth;
    const height = options.height || window.innerHeight;

    // Create SVG inside container
    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }));

    // Add title
    d3.select(container)
        .append("h1")
        .style("position", "absolute")
        .style("top", "10px")
        .style("left", "20px")
        .style("color", "#0a0a0a")
        .style("font-size", "20px")
        .text(title);

    const g = svg.append("g");

    const colorScale = d3.scaleOrdinal(d3.schemeObservable10);

    // Scale node radius based on reference count
    const refExtent = d3.extent(nodes, d => d.refs.length);
    const radiusScale = d3.scaleLinear()
        .domain(refExtent)
        .range([8, 30]);

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Links
    const link = g.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#888")
        .attr("stroke-opacity", 0.6);

    // Nodes
    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(drag(simulation));

    node.append("circle")
        .attr("r", d => radiusScale(d.refs.length))
        .attr("fill", d => colorScale(d.theme))
        .attr("stroke", "#888")
        .attr("stroke-width", 1.5);

    node.append("text")
        .attr("class", "label")
        .attr("x", d => radiusScale(d.refs.length) + 5)
        .attr("y", 4)
        .attr("fill", "#0a0a0a")
        .attr("font-size", 12)
        .text(d => d.id);

    // Reference pop-up
    const openPopups = new Map();

    node.on("click", (event, d) => {
        if (openPopups.has(d.id)) {
            openPopups.get(d.id).remove();
            openPopups.delete(d.id);
        } else {
            const popup = g.append("g").attr("class", "popup");
            const lines = [d.id, ...d.refs];
            const padding = 6;
            const lineHeight = 16;

            popup.selectAll("text")
                .data(lines)
                .enter().append("text")
                .attr("x", radiusScale(d.refs.length) + 28)
                .attr("y", (line, i) => -(lines.length - 1) * lineHeight / 2 + i * lineHeight)
                .attr("fill", "#0a0a0a")
                .text(line => line);

            const bbox = popup.node().getBBox();

            popup.insert("rect", "text")
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding)
                .attr("width", bbox.width + padding * 2)
                .attr("height", bbox.height + padding * 2)
                .attr("fill", "#F0F0F0")
                .attr("stroke", "#888")
                .attr("rx", 4)
                .attr("ry", 4);

            popup.attr("transform", `translate(${d.x},${d.y})`);
            openPopups.set(d.id, popup);
        }
        event.stopPropagation();
    });

    // Update pop-up locations after zoom/move
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);

        openPopups.forEach((popup, id) => {
            const nd = nodes.find(n => n.id === id);
            popup.attr("transform", `translate(${nd.x},${nd.y})`);
        });
    });
    
    // Legend
    const themes = Array.from(new Set(nodes.map(d => d.theme)));
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(20, 60)`);

    themes.forEach((theme, i) => {
        const y = i * 20;
        legend.append("rect")
            .attr("x", 0)
            .attr("y", y)
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", colorScale(theme))
        legend.append("text")
            .attr("x", 20)
            .attr("y", y + 12)
            .attr("fill", "#0a0a0a")
            .text(theme);
    });

    // Drag behavior
    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = d.x; // Keep node pinned in new location after drag
            d.fy = d.y;
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}