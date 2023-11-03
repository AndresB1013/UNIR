(() => {
    // Definición de Variables para acceder a las etiquetas HTML
    const BtnSelector = d3.select("#aplicarFiltro");
    const BtnCambiarTema = d3.select("#changeThemeBtn");
    const Año = d3.select("#filtro");
    let Tema = d3.select("#Tema");
    const graficos = d3.select("#contenedor");
    const Titulo = d3.select("#Titulo");

    // Definición de tamaños del espacio para el grafico
    const width = 1600;
    const height = (width/2) + 100;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Ocultar la estiqueta HTML donde ira el grafico
    graficos.style("display", "none");

    // Crear funcion para cargar datos y el tema de la pagina
    function loadData(b, filtro,color) {
        loadTheme();

        // Difinir la etiqueta SVG donde se incluira el grafico de lineas
        var svg = d3.select("#line")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height + 50])
            .attr("style", "max-width: 100%; height: auto")
            .style("-webkit-tap-highlight-color", "transparent")
            .style("overflow", "visible");

        // Agregar etiqueta HTML donde se pintara el grafico
        svg.append("path");

        // Agregar etiqueta HTML que mostrara el Eje X
        svg.append("g").attr("class", "x-axis");

        // Agregar etiqueta HTML que mostrara el Eje Y
        svg.append("g").attr("class", "y-axis");

        // Ejecutar Promesa para lectura de datos de la fuente
        d3.json("indicadores_del_mercado_inmobiliario.json").then(data => {
            var vivienda = data.Respuesta.Datos.Metricas[b].Datos;

            // Crear funcion para filtrar datos segun el numero escogido en el Input
            var filtro_año = vivienda.filter(function (d) {
                return new Date(d.Agno) >= filtro;
            })

            // Definir la escala de datos del eje X
            const xScale = d3.scaleBand()
                .domain(filtro_año.map(d => convertirAMes(d.Parametro) + " - " + d.Agno))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            // Definir la escala de datos del eje Y
            const yScale = d3.scaleLinear([d3.min(filtro_año, d => d.Valor), d3.max(filtro_año, d => d.Valor)], [height - margin.bottom, margin.top]);

            // Crear la variable para crear grafico Lineas
            const line = d3.line()
                .x(d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno) + 17)
                .y(d => yScale(d.Valor));

            // Agregar ejes al grafico
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            // Pintar el eje X en la grafica
            svg.select("g.x-axis")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(xAxis);

            // Pintar el eje Y en la grafica
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

            // Pintar la linea para cada punto, definiendo grosor y animacion de union de puntos
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


            // Agregar puntos de dispersion a la grafica de lineas
            svg.selectAll("circle")
                .data(filtro_año)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(convertirAMes(d.Parametro) + " - " + d.Agno) + 17)
                .attr("cy", d => yScale(d.Valor))
                .attr("r", 3);

            // Funcion para trasformar la variable Parametro para los meses de Enero de cada año
            function convertirAMes(valor) {
                if (valor === "2017" || valor === "2018" || valor === "2019" || valor === "2020" || valor === "2021" || valor === "2022" || valor === "2023") {
                    return "Enero";
                }
                return valor;
            }

            // Modificar el tamaño y orientacion de las etiquetas del eje X
            svg.selectAll(".x-axis text")
                .style("text-anchor", "end")
                .style("font-size","large")
                .attr("transform", "rotate(-45)")
                .attr("dx", "-.8em")
                .attr("dy", ".15em");

            // Modificar tamaño de las etiquetas del eje Y
            svg.selectAll(".y-axis text")
            .style("font-size","large");

            // Crear variable y etiqueta HTML para añadir el tooltip a la grafica
            const tooltip = svg
                .append("g")
                .attr("class", "tooltip")
                .style("opacity", 0.5);

            // Configurar el tamaño del tooltip
            const tooltipWidth = 220;
            const tooltipHeight = 50;

            // Crear el rectangulo contenedor de los datos del tooltip
            tooltip.append("rect")
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("fill", "white")
                .attr("stroke", "gray")
                .text("Soy Tooltip")
                .style("opacity", 0.5);

            // Definir Variables para añadir datos al tooltip
            const textValue = svg.select("g.tooltip")
                .append("text")
                .style("font-size","large")
                .attr("x", 10)
                .attr("y", 20);

            const textParameter = svg.select("g.tooltip").append("text")
            .style("font-size","large")
                .attr("x", 10)
                .attr("y", 40);

            // Agregar interacción para mostrar el tooltip cuando se ubica el cursor sobre el punto
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
        })
    }

    // Configurar accion del Boton "Aceptar" para guardar los datos del año y variable a mostrar
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

    // Crear funcion para modificar el tema de la pagina entre Modo Claro y Modo Noche
    function loadTheme() {
        const theme = localStorage.getItem("theme") || "light";
        document.body.dataset.bsTheme = theme;
        if (theme == "dark") {
            BtnCambiarTema.text("Modo Claro");
        } else {
            BtnCambiarTema.text("Modo Noche");
        }
    }

    // Crear accion para modificar el tema de la pagina
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