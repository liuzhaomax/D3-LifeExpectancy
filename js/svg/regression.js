/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 3:23
 * @version     v1.0
 * @filename    regression.js
 * @description
 ***************************************************************************/

function createRegression(factors) {
    // remove all elements in svg
    document.getElementById('regression').innerHTML = ''
    // data
    let data = project.data.list
    let header = deepClone(project.data.header)
    header.remove('Life.expectancy')
    header.remove('Country')
    header.remove('Region')

    let width = 420
    let height = 229
    let svg = d3.select('#regression')
    let g = svg.append('g').attr('transform', 'translate(0,20)')
    // title
    svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text('Scaled Linear Regression Lines of Factors')
    // init
    for (let i = 0; i < header.length; i++) {
        createRegLine(factors, data, g, header[i], width, height)
    }
    // line text
    let lineText
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 150)
        .attr('y', 190)
        .attr('transform', 'rotate(-35)')
        .text(header[0])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 230)
        .attr('y', 237)
        .attr('transform', 'rotate(-5)')
        .text(header[1])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 225)
        .attr('y', 238)
        .attr('transform', 'rotate(-11)')
        .text(header[2])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 200)
        .attr('y', 232)
        .attr('transform', 'rotate(-16)')
        .text(header[3])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 180)
        .attr('y', 215)
        .attr('transform', 'rotate(-16)')
        .text(header[4])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 120)
        .attr('y', 165)
        .attr('transform', 'rotate(-44)')
        .text(header[5])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 130)
        .attr('y', 210)
        .attr('transform', 'rotate(-34)')
        .text(header[6])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 200)
        .attr('y', 224)
        .attr('transform', 'rotate(-11)')
        .text(header[7])
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 200)
        .attr('y', 237)
        .attr('transform', 'rotate(-9)')
        .text('ICoR')
    lineText = g.append('text').attr('class', 'regression-label')
    lineText.attr('text-anchor', 'middle')
        .attr('x', 50)
        .attr('y', 130)
        .attr('transform', 'rotate(-53)')
        .text(header[9])
}


function createRegLine(factors, data, g, title, width, height) {
    // data
    let xData = data.map(d => Number(d[title]))
    let yData = data.map(d => Number(d['Life.expectancy']))
    // axis
    let xScale = d3.scaleLinear().domain([d3.min(xData), d3.max(xData)]).rangeRound([0, width])
    let yScale = d3.scaleLinear().domain([d3.min(yData), d3.max(yData)]).rangeRound([height, 0])
    g.append('g').call(d3.axisBottom(xScale)).attr('transform', 'translate(0,' + height + ')')
    g.append('g').call(d3.axisLeft(yScale))
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
    let lastX = d3.max(xData)
    let xCoordinates = [0, lastX]
    let regressionPoints = xCoordinates.map(d => ({
        x: xScale(d),
        y: yScale(linearRegressionLine(d))
    }))
    // abs(y) and move to origin
    regressionPoints = regressionPoints.map(d => {
        if (regParams.m < 0) {
            return {x: d.x, y: -d.y}
        } else {
            return {x: d.x, y: d.y}
        }
    })
    let y1 = regressionPoints[0].y
    if (y1 > 0) {
        regressionPoints[1].y = regressionPoints[1].y - y1
        regressionPoints[0].y = 0
    } else {
        regressionPoints[1].y = regressionPoints[1].y + y1
        regressionPoints[0].y = 0
    }
    let x1 = regressionPoints[0].x
    if (x1 > 0) {
        regressionPoints[1].x = regressionPoints[1].x - x1
        regressionPoints[0].x = 0
    } else {
        regressionPoints[1].x = regressionPoints[1].x + x1
        regressionPoints[0].x = 0
    }
    // cut the line to fix div
    let y2 = regressionPoints[1].y
    if (y2 > height) {
        regressionPoints[1].y = height
        regressionPoints[0].y = regressionPoints[0].y - (regressionPoints[1].y - height)
    }
    let x2 = regressionPoints[1].x
    if (x2 > width) {
        regressionPoints[1].x = width
        regressionPoints[0].x = regressionPoints[0].x - (regressionPoints[1].x - width)
    }
    // generate line path
    let line = d3.line().x(d => d.x).y(d => d.y)
    // regression
    let regLine = g.append('path').classed('regressionLine', true).datum(regressionPoints)
        .transition().delay((d, i) => (i + 1) * 20).duration(300).ease(d3.easeBounceIn)
        .attr('d', line)
    regLine.attr('transform', 'translate(0,' + height + ')')
        .transition().delay((d, i) => (i + 1) * 20).duration(300).ease(d3.easeBounceIn)
        .attr('stroke-width', '2px')
        .attr('stroke', d => {
            if (Array.from(factors).indexOf(title) !== -1) {
                return '#ffa200'
            } else {
                if (regParams.m <= 0) {
                    return 'blue'
                } else {
                    return 'red'
                }
            }
        })
}