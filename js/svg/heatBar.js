/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/31 23:29
 * @version     v1.0
 * @filename    heatBar.js
 * @description
 ***************************************************************************/

function createHeatBar(factors) {
    // remove all elements in svg
    document.getElementById('heat-bar').innerHTML = ''
    // data
    let rawData = processDataHeat()[0]
    let rawHeader = processDataHeat()[1]
    let correlation = generateCorrelation(rawData)
    let corLE = correlation[0]
    let data = processDataHeatBar(rawHeader, corLE)
    let header = data.map(d => d.factor)

    let svg = d3.select('#heat-bar')
    let g = svg.append('g').attr('transform', 'translate(170,0)')
    // color
    let colorValue = d => 1 - (d.value * 10 + 10) / 20
    // axis
    let yScale = d3.scaleBand().domain(header).rangeRound([0, 440])
    g.append('g').call(d3.axisLeft(yScale))
    // rect
    let chart = g.selectAll('#heat-bar').data(data).enter().append('g')
    chart.append('rect')
        // .attr('class', 'heat-bar-rect')
        .attr('x', 5)
        .attr('y', d => yScale(d.factor))
        .attr('padding', 1.5)
        .attr('cursor', 'pointer')
        .attr('opacity', 1)
        .attr('fill', d => {
            if (d.value >= 0) {
                return d3.interpolateSpectral(colorValue(d))
            } else {
                return d3.interpolateSpectral(colorValue(d))
            }
        })
        .attr('stroke', d => {
            if (factors.has(d.factor)) {
                return '#000'
            } else {
                return '#FFF'
            }
        }).attr('stroke-width', '3px')
        .transition().delay((d, i) => (i + 1) * 20).duration(300).ease(d3.easeCircleIn)
        .attr('width', 40)
        .attr('height', yScale.bandwidth() - 3) // padding for stroke width
    chart.on('click', function (d) {
        if (project.factors.has(d.factor)) {
            project.factors.delete(d.factor)
        } else {
            project.factors.add(d.factor)
        }
        displayFactors()
        createHeatBar(project.factors)
        createRegression(project.factors)
        createScatters(project.factors)
    })
    // text
    chart.append('text')
        .attr('fill', '#FFF')
        .attr('cursor', 'pointer')
        .attr('y', d => yScale(d.factor) + 25)
        .transition().delay((d, i) => (i + 1) * 20).duration(300).ease(d3.easeCircleIn)
        .attr('x', 10)
        .text(d => d.value.toFixed(2))
    // tooltip
    let tooltip = d3.select('#tooltip-heat-bar')
    let parent = document.getElementsByClassName('main-south-north')[0]
    // hover
    chart.on('mouseover', function(d) {
        d3.select(this).attr('opacity', 0.7)
        tooltip.html(createTooltipHeatBar(d))
            .transition().duration(0)
            .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
            .style('margin-top', d3.mouse(parent)[1] + 845 + 'px')
            .style('display', 'block')
        })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 0.7)
            tooltip.html(createTooltipHeatBar(d))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 845 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition().delay(100).duration(500)
                .attr('opacity', 1)
        })
    svg.on('mouseout', function() {
        tooltip
            .transition().duration(500)
            .style('display', 'none')
    })
}

function createTooltipHeatBar(d) {
    let parent = document.getElementById('tooltip-heat-bar')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = `Life.expectancy and ${d.factor} <br/>`
    parent.appendChild(text)
    text = document.createElement('p')
    text.innerHTML = `Correlation Coefficient: <span>${d.value}</span>`
    parent.appendChild(text)
    return parent.innerHTML
}

function processDataHeatBar(header, corLE) {
    let result = []
    let tempMap
    for (let i = 0; i < header.length; i++) {
        tempMap = {}
        tempMap['factor'] = header[i]
        tempMap['value'] = corLE[i]
        result.push(tempMap)
    }
    result = quickSortByAttribute(result, 'value', 'desc')
    return result
}

let btnHeatBar = document.getElementById('btn-heat-bar-visibility')
btnHeatBar.addEventListener('click', () => {
    let heatBar = document.getElementById('heat-bar')
    let flag = false
    for (const item of btnHeatBar.classList) {
        flag = flag || item === 'btn-activated'
    }
    if (flag === true) {
        btnHeatBar.classList.remove('btn-activated')
        btnHeatBar.value = 'Close Side Bar'
        heatBar.style.display = 'block'
    } else {
        btnHeatBar.classList.add('btn-activated')
        btnHeatBar.value = 'Open Side Bar'
        heatBar.style.display = 'none'
    }
})
