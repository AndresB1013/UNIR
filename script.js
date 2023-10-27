// Declare the chart dimensions and margins.
const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
// const changeThemeBtn = document.getElementById("changeThemeBtn");

// Selecciona el contenedor del gráfico de dispersión
var svg = d3.select("#line").append("svg")
    .attr("widht", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width + 50, height + 50])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .style("-webkit-tap-highlight-color", "transparent")
    .style("overflow", "visible");


d3.json("indicadores_del_mercado_inmobiliario.json").then(data => {

    var vivienda_nueva = data.Respuesta.Datos.Metricas[0].Datos;

    var elementoUl = d3.select("#line").append("ul");
    console.log(vivienda_nueva);

    var vivienda_nueva_filtrada = vivienda_nueva.filter(function (d) {
        return new Date(d.Agno) >= new Date(2022);

    })

    const xScale = d3.scaleBand()
        .domain(vivienda_nueva_filtrada.map(d => convertirAMes(d.Parametro) + " - " + d.Agno))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear([d3.min(vivienda_nueva_filtrada, d => d.Valor), d3.max(vivienda_nueva_filtrada, d => d.Valor)], [height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno))
        .y(d => yScale(d.Valor));

    // Agrega ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

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
            .text("↑ Variacion Mes (%)"));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(vivienda_nueva_filtrada));

    svg.selectAll("circle")
        .data(vivienda_nueva_filtrada)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno))
        .attr("cy", d => yScale(d.Valor))
        .attr("r", 3);

    function convertirAMes(valor) {
        if (valor === "2022" || valor === "2023") {
            return "Enero";
        }
        return valor;
    }

    svg.selectAll(".x-axis text") // Selecciona las etiquetas del eje X
        .style("text-anchor", "end") // Alinea el texto al final del elemento
        .attr("transform", "rotate(-45)") // Rota el texto en sentido antihorario
        .attr("dx", "-.8em") // Ajusta la posición horizontal
        .attr("dy", ".15em"); // Ajusta la posición vertical;

    const tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    const tooltipWidth = 150; // Ancho del tooltip
    const tooltipHeight = 50; // Altura del tooltip

    tooltip.append("rect")
        .attr("width", tooltipWidth)
        .attr("height",tooltipHeight)
        .attr("fill", "white")
        .attr("stroke", "gray");

    const textValue = tooltip.append("text")
        .attr("x", 10)
        .attr("y", 20);

    const textParameter = tooltip.append("text")
        .attr("x", 10)
        .attr("y", 40);

// Agregar interacción para mostrar el tooltip
svg.selectAll("circle")
    .on("mouseover", function (event, d) {
        const xPos = xScale(convertirAMes(d.Parametro) + " - " + d.Agno);
        const yPos = yScale(d.Valor);

        tooltip.style("display", "block")
            .attr("transform", `translate(${xPos},${yPos})`);

        textValue.text(`Variacion: ${d.Valor.toFixed(2)} %`);
        textParameter.text(`Mes: ${convertirAMes(d.Parametro)}`);
    })
    .on("mouseout", function () {
        tooltip.style("display", "none");
    });


    vivienda_nueva_filtrada.forEach(function (d) {
        elementoUl.append("li").text(d.Agno + " - " + d.Parametro + " => " + d.Valor);
    })

    // function loadTheme() {
    //     const theme = localStorage.getItem("theme") || "light";
    //     document.body.dataset.bsTheme = theme;
    //     if (theme == "dark") {
    //         changeThemeBtn.textContent = "Light Mode";
    //     } else {
    //         changeThemeBtn.textContent = "Dark Mode";
    //     }
    // }

    // changeThemeBtn.addEventListener("click", function () {
    //     let body = document.body;
    //     if (body.dataset.bsTheme == "dark") {
    //         body.dataset.bsTheme = "light";
    //         changeThemeBtn.textContent = "Dark Mode";
    //         localStorage.setItem("theme", "light");
    //     } else {
    //         body.dataset.bsTheme = "dark";
    //         changeThemeBtn.textContent = "Light Mode";
    //         localStorage.setItem("theme", "dark");
    //     }
    // });


    console.log(vivienda_nueva_filtrada);

})

