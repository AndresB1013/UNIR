// Tamaño del lienzo y márgenes
const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Selecciona el contenedor del gráfico de dispersión
var svg = d3.select("#line").append("svg")
    .attr("widht", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .style("-webkit-tap-highlight-color", "transparent")
    .style("overflow", "visible");


// Carga los datos desde el archivo JSON
d3.json("indicadores_del_mercado_inmobiliario.json").then(data => {

    var vivienda_nueva = data.Respuesta.Datos.Metricas[0].Datos;

    var elementoUl = d3.select("#line").append("ul");
    console.log(vivienda_nueva);

    var vivienda_nueva_filtrada = vivienda_nueva.filter(function (d) {
        return new Date(d.Agno) >= new Date(2022);
    })

    const tooltip = svg.append("g");

    const bisect = d3.bisector(d => d.Parametro).center;

    const xScale = d3.scaleUtc(d3.extent(vivienda_nueva_filtrada, d => d.Parametro), [margin.left, width - margin.right]);

    const yScale = d3.scaleLinear([0, d3.max(vivienda_nueva_filtrada, d => d.Valor)], [height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => xScale(d.Parametro))
        .y(d => yScale(d.Valor));

    // Agrega ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis.ticks(width / 80).tickSizeOuter(0));

    svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis.ticks(height / 40))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", innerWidth)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", - margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Daily close ($)"));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(vivienda_nueva_filtrada));


    function size(text, path) {
        const {x, y, width: w, height: h} = text.node().getBBox();
        text.attr("transform", `translate(${-w / 2},${15 - y})`);
        path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

    function formatValue(value) {
        return value.toLocaleString("en", {
            style: "currency",
            currency: "EUR"
        });
    }
    function pointermoved(event) {
        const i = bisect(vivienda_nueva_filtrada, xScale.invert(d3.pointer(event)[0]));
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${xScale(vivienda_nueva_filtrada[i].Parametro)},${yScale(vivienda_nueva_filtrada[i].Valor)})`);

        const path = tooltip.selectAll("path")
            .data([,])
            .join("path")
            .attr("fill", "white")
            .attr("stroke", "black");

        const text = tooltip.selectAll("text")
            .data([,])
            .join("text")
            .call(text => text
                .selectAll("tspan")
                .data([(vivienda_nueva_filtrada[i].Parametro), formatValue(vivienda_nueva_filtrada[i].Valor)])
                .join("tspan")
                .attr("x", 0)
                .attr("y", (_, i) => `${i * 1.1}em`)
                .attr("font-weight", (_, i) => i ? null : "bold")
                .text(d => d));

        size(text, path);
    }

    function pointerleft() {
        tooltip.style("display", "none");
    }

    svg.on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

    vivienda_nueva_filtrada.forEach(function (d) {
        elementoUl.append("li").text(d.Agno + " - " + d.Parametro + " => " + d.Valor);
    })


    console.log(vivienda_nueva_filtrada);

});