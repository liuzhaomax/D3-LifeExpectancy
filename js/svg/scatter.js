/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 3:21
 * @version     v1.0
 * @filename    scatter.js
 * @description
 ***************************************************************************/

function createScatters(factors) {
    let scatterID
    let width = 93
    let height = 80
    // data
    let data = project.data.list
    let header = deepClone(project.data.header)
    header.remove('Life.expectancy')
    header.remove('Country')
    header.remove('Region')
    // init
    for (let i = 0; i < header.length; i++) {
        scatterID = 'scatter-' + (i + 1)
        createScatter(factors, scatterID, data, width, height, header[i])
    }
}

function createScatter(factors, scatterID, data, width, height, title) {
    // remove all elements in svg
    document.getElementById(scatterID).innerHTML = ''
    // data
    let xData = data.map(d => Number(d[title]))
    let yData = data.map(d => Number(d['Life.expectancy']))

    let svg = d3.select('#' + scatterID)
    let g = svg.append('g').attr('transform', 'translate(20,20)')
    // axis
    let xScale = d3.scaleLinear().domain([d3.min(xData), d3.max(xData)]).rangeRound([0, width])
    let yScale = d3.scaleLinear().domain([d3.min(yData), d3.max(yData)]).rangeRound([height, 0])
    g.append('g').call(d3.axisBottom(xScale).ticks(3)).attr('transform', 'translate(0,' + height + ')')
    g.append('g').call(d3.axisLeft(yScale).ticks(3))
    // title
    if (title === 'Income.composition.of.resources') {
        svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text('ICoR')
    } else {
        svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text(title)
    }
    // scatter
    let chart = g.selectAll('circle').data(data).enter().append('circle')
        .transition().delay((d, i) => (i + 1) * 2).duration(200).ease(d3.easeBounceIn)
    chart.attr('fill', d => {
        if (Array.from(factors).indexOf(title) !== -1) {
            return '#ffa200'
        } else {
            return '#54ba71'
        }
    })
        .attr('r', 2.5)
        .attr('opacity', 0.4)
        .attr('cx', d => xScale(d[title]))
        .attr('cy', d => yScale(d['Life.expectancy']))
    // prepare regression line
    for (let i = xData.length - 1; i >= 0; i--) {
        if (xData[i] === 0 || yData[i] === 0) {
            xData.remove(xData[i])
            yData.remove(yData[i])
        }
    }
    let regData = []
    for (let i = 0; i < xData.length; i++) {
        regData.push([xData[i], yData[i]])
    }
    let regParams = ss.linearRegression(regData)
    let linearRegressionLine = ss.linearRegressionLine(regParams)
    let firstX = d3.min(xData)
    let lastX = d3.max(xData)
    let xCoordinates = [firstX, lastX]
    let regressionPoints = xCoordinates.map(d => ({
        x: d,
        y: linearRegressionLine(d)
    }))
    let line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
    // regression
    let regLine = g.append('path').datum(regressionPoints)
        .transition().delay((d, i) => (i + 1) * 20).duration(300).ease(d3.easeBounceIn)
    regLine.attr('d', line)
        .attr('stroke-width', '2px')
        .attr('stroke', d => {
            if (regParams.m <= 0) {
                return 'blue'
            } else {
                return 'red'
            }
        })
}