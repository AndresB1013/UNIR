(() => {
    // Definición de Variables para acceder a las etiquetas HTML
    const BtnSelector = d3.select("#aplicarFiltro");
    const BtnCambiarTema = d3.select("#changeThemeBtn");
    const Año = d3.select("#filtro");
    let Tema = d3.select("#Tema");
    const graficos = d3.select("#contenedor");
    const Titulo = d3.select("#Titulo");

    const width = 1600;
    const height = (width/2) + 100;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    graficos.style("display", "none");

    function loadData(b, filtro,color) {
        loadTheme();

        var svg = d3.select("#line")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height + 50])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .style("-webkit-tap-highlight-color", "transparent")
            .style("overflow", "visible");

        svg.append("path");

        svg.append("g").attr("class", "x-axis");

        svg.append("g").attr("class", "y-axis");


        d3.json("indicadores_del_mercado_inmobiliario.json").then(data => {
            var vivienda = data.Respuesta.Datos.Metricas[b].Datos;

            var elementoUl = d3.select("#line").append("ul");
            var filtro_año = vivienda.filter(function (d) {
                return new Date(d.Agno) >= filtro;
            })

            const xScale = d3.scaleBand()
                .domain(filtro_año.map(d => convertirAMes(d.Parametro) + " - " + d.Agno))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const yScale = d3.scaleLinear([d3.min(filtro_año, d => d.Valor), d3.max(filtro_año, d => d.Valor)], [height - margin.bottom, margin.top]);

            const line = d3.line()
                .x(d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno) + 17)
                .y(d => yScale(d.Valor));

            // Agrega ejes
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            svg.select("g.x-axis")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(xAxis);

            svg.select("g.y-axis")
                .attr("class", "y-axis")
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
                    .text("↑ Variación Mes (%)"));


            svg.select("path")
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("width", innerWidth)
                .attr("d", line(filtro_año))
                .style("stroke-dasharray", function () {
                    return this.getTotalLength() + " " + this.getTotalLength();
                })
                .style("stroke-dashoffset", function () {
                    return this.getTotalLength();
                })
                .transition()
                .duration(7000) // Duración de la animación en milisegundos
                .ease(d3.easeLinear)
                .style("stroke-dashoffset", 0);



            svg.selectAll("circle")
                .data(filtro_año)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno) + 17)
                .attr("cy", d => yScale(d.Valor))
                .attr("r", 3);

            function convertirAMes(valor) {
                if (valor === "2017" || valor === "2018" || valor === "2019" || valor === "2020" || valor === "2021" || valor === "2022" || valor === "2023") {
                    return "Enero";
                }
                return valor;
            }

            //ETIQUETAS DEL EJE X
            svg.selectAll(".x-axis text") // Selecciona las etiquetas del eje X
                .style("text-anchor", "end")
                .style("font-size","large") // Alinea el texto al final del elemento
                .attr("transform", "rotate(-45)") // Rota el texto en sentido antihorario
                .attr("dx", "-.8em") // Ajusta la posición horizontal
                .attr("dy", ".15em"); // Ajusta la posición vertical;

            svg.selectAll(".y-axis text")
            .style("font-size","large");

            const tooltip = svg
                .append("g")
                .attr("class", "tooltip")
                .style("opacity", 0.5);

            const tooltipWidth = 150; // Ancho del tooltip
            const tooltipHeight = 50; // Altura del tooltip

            tooltip.append("rect")
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .text("Soy Tooltip")
                .style("opacity", 0.5);

            const textValue = svg.select("g.tooltip")
                .append("text")
                .style("font-size","large")
                .attr("x", 10)
                .attr("y", 20);

            const textParameter = svg.select("g.tooltip").append("text")
            .style("font-size","large")
                .attr("x", 10)
                .attr("y", 40);

            // Agregar interacción para mostrar el tooltip
            svg.selectAll("circle")
                .on("mouseover", function (event, d) {
                    const xPos = xScale(convertirAMes(d.Parametro) + " - " + d.Agno) + 17;
                    const yPos = yScale(d.Valor);

                    tooltip.style("display", "block")
                    .attr("transform", `translate(${xPos},${yPos})`);

                    textValue.text(`Variacion: ${d.Valor.toFixed(2)} %`);

                    textParameter.text(`Mes: ${convertirAMes(d.Parametro) + " - " + d.Agno}`);
                    tooltip.transition().duration(200).style("opacity", 0.9);
                })

                .on("mouseout", function () {
                    tooltip.style("display", "none");
                    tooltip.style("opacity", 0);
                });

            // filtro_año.forEach(function (d) {
            //     elementoUl.append("li").text(d.Agno + " - " + convertirAMes(d.Parametro) + " => " + d.Valor);
            // })


            console.log(filtro)
            console.log(filtro_año);

        })
    }

    BtnSelector.on("click", () => {
        d3.select("svg").remove();
        var filtro = Año.property("value")

        if (Tema.property("value") == "Todas") {
            graficos.style("display", "block");
            loadData(2, filtro,"orange");
            Titulo.text("Gráfico de Variacion porcentual mensual de Compra de Viviendas nuevas y segunda Mano - España")
        }
        else if (Tema.property("value") == "Nuevas") {
            graficos.style("display", "block");
            loadData(0, filtro,"blue");
            Titulo.text("Gráfico de Variacion porcentual mensual de Compra de Viviendas nuevas - España")

        }
        else {
            graficos.style("display", "block");
            loadData(1, filtro,"green");
            Titulo.text("Gráfico de Variacion porcentual mensual de Compra de Viviendas segunda Mano - España")
        }
    })

    function loadTheme() {
        const theme = localStorage.getItem("theme") || "light";
        document.body.dataset.bsTheme = theme;
        if (theme == "dark") {
            BtnCambiarTema.text("Modo Claro");
        } else {
            BtnCambiarTema.text("Modo Noche");
        }
    }

    BtnCambiarTema.on("click", function () {
        const body = d3.select("body");
        const currentTheme = body.attr("data-bs-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        body.attr("data-bs-theme", newTheme);
        d3.select("#changeThemeBtn").text(newTheme === "dark" ? "Modo Claro" : "Modo Noche");
        localStorage.setItem("theme", newTheme);
    });

    // Llama a loadTheme() cuando la página se carga
    loadData();
})();