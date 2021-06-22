/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 3:21
 * @version     v1.0
 * @filename    heat.js
 * @description
 ***************************************************************************/

function createHeat() {
    // remove all elements in svg
    document.getElementById('heat').innerHTML = ''
    document.getElementById('legend-heat').innerHTML = ''
    // data
    let data = processDataHeat()[0]
    let header = processDataHeat()[1]
    let correlation = generateCorrelation(data)
    // 3d heat
    let parent = document.getElementsByClassName('main-south-north')[0]
    let width = parent.getBoundingClientRect().width
    let height = parent.getBoundingClientRect().height
    let origin = [300, 230], scale = 15, j = correlation.length - 1, alpha = 0, beta = 0,
        startAngle = -Math.PI*5/6
        // startAngle = Math.PI/3
        // startAngle = -Math.PI/2
        // startAngle = Math.PI/2
    let mx, my, mouseX, mouseY, dragging = false

    let svg = d3.select('#heat').attr('width', width).attr('height', height)
        .call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd))
    let g = svg.append('g').attr('class', 'cubes')
    svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text('Coefficient Matrix of Pearson Correlation')
    svg.append('text').attr('x', 0).attr('y', 455).attr('font-weight', 600).text('View Angle:')
    initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
    // press btn front
    document.getElementById('btn-heat-n-pi-5-6').addEventListener('click', () => {
        document.getElementById('btn-heat-n-pi-5-6').classList.add('btn-activated')
        document.getElementById('btn-heat-p-pi-3').classList.remove('btn-activated')
        document.getElementById('btn-heat-n-pi-2').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-2').classList.remove('btn-activated')
        startAngle = -Math.PI*5/6
        document.getElementsByClassName('cubes')[0].innerHTML = ''
        initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
    })
    // press btn back
    document.getElementById('btn-heat-p-pi-3').addEventListener('click', () => {
        document.getElementById('btn-heat-n-pi-5-6').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-3').classList.add('btn-activated')
        document.getElementById('btn-heat-n-pi-2').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-2').classList.remove('btn-activated')
        startAngle = Math.PI/3
        document.getElementsByClassName('cubes')[0].innerHTML = ''
        initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
    })
    // press btn top
    document.getElementById('btn-heat-n-pi-2').addEventListener('click', () => {
        document.getElementById('btn-heat-n-pi-5-6').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-3').classList.remove('btn-activated')
        document.getElementById('btn-heat-n-pi-2').classList.add('btn-activated')
        document.getElementById('btn-heat-p-pi-2').classList.remove('btn-activated')
        startAngle = -Math.PI/2
        document.getElementsByClassName('cubes')[0].innerHTML = ''
        initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
    })
    // press btn bottom
    document.getElementById('btn-heat-p-pi-2').addEventListener('click', () => {
        document.getElementById('btn-heat-n-pi-5-6').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-3').classList.remove('btn-activated')
        document.getElementById('btn-heat-n-pi-2').classList.remove('btn-activated')
        document.getElementById('btn-heat-p-pi-2').classList.add('btn-activated')
        startAngle = Math.PI/2
        document.getElementsByClassName('cubes')[0].innerHTML = ''
        initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
    })

    legend({
        selection: d3.select('#legend-heat'),
        color: d3.scaleSequential(getLegendTickRange(1, -1), d3.interpolateSpectral),
        title: 'Correlation Coefficients',
    })

    function dragStart() {
        mx = d3.event.x
        my = d3.event.y
    }

    function dragged() {
        dragging = true
        mouseX = mouseX || 0
        mouseY = mouseY || 0
        beta   = (d3.event.x - mx + mouseX) * Math.PI / 230
        alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1)
        initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta)
        dragging = false
    }

    function dragEnd() {
        mouseX = d3.event.x - mx + mouseX
        mouseY = d3.event.y - my + mouseY
    }
}

function initHeat(correlation, header, svg, g, origin, scale, j, startAngle, dragging, alpha, beta) {
    let cubes3D = d3._3d()
        .shape('CUBE')
        .x(d => d.x)
        .y(d => d.y)
        .z(d => d.z)
        .rotateX(-startAngle)
        .rotateY(startAngle)
        .origin(origin)
        .scale(scale)
    let cubesData = initCubesData(correlation, header, j)
    if (dragging) {
        buildHeat(cubes3D, cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), header, svg, g, origin, scale, startAngle)
    } else {
        buildHeat(cubes3D, cubes3D(cubesData), header, svg, g, origin, scale, startAngle)
    }
}

function buildHeat(cube3DObj, data, header, svg, g, origin, scale, startAngle){
    // color
    let colorValue = d => 1 - (d.value * 10 + 10) / 20
    // cubes
    let cubes = g.selectAll('g.cube').data(data, d => d.id)
    let ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .attr('fill', d => {
            if (d.value >= 0) {
                return d3.interpolateSpectral(colorValue(d))
            } else {
                return d3.interpolateSpectral(colorValue(d))
            }
        })
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
        .attr('opacity', 0.9)
        .merge(cubes)
        .sort(cube3DObj.sort)
    cubes.exit().remove()
    // faces
    let faces = cubes.merge(ce).selectAll('path.face').data(d => d.faces, d => d.face)
    faces.enter()
        .append('path')
        .attr('class', 'face')
        .classed('_3d', true)
        .merge(faces)
        .transition().duration(500)
        .attr('d', cube3DObj.draw)
    faces.exit().remove()
    // text
    let texts = cubes.merge(ce).selectAll('text.text').data(d => {
        let _t = d.faces.filter(d => d.face === 'top')
        return [{value: d.value, centroid: _t[0].centroid}]
    })
    texts.enter()
        .append('text')
        .attr('class', 'text')
        .attr('dy', '-.3em')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bolder')
        .attr('x', d => origin[0] + scale * d.centroid.x)
        .attr('y', d => origin[1] + scale * d.centroid.y)
        .classed('_3d', true)
        .merge(texts)
        .transition().duration(500)
        .attr('fill', 'black')
        .attr('stroke', 'none')
        .attr('x', d => origin[0] + scale * d.centroid.x)
        .attr('y', d => origin[1] + scale * d.centroid.y)
        .tween('text', function(d) {
            let that = d3.select(this)
            let i = d3.interpolateNumber(+that.text(), Math.abs(d.value))
            return t => {
                that.text(i(t).toFixed(2))
            }
        })
    texts.exit().remove()
    // axis
    let axisY
    let axisX
    // axis Y
    if (startAngle === Math.PI/3 || startAngle === Math.PI/2) {
        axisY = cubes.merge(ce).selectAll('text.axis-y').data(d => {
            let _t = d.faces.filter(d => d.face === 'bottom')
            return [{obj1: d.obj1, obj2: d.obj2, centroid: _t[0].centroid}]
        })
        axisY.enter()
            .append('text')
            .attr('class', 'axis-y')
            .attr('dx', '3em')
            .attr('dy', '3px')
            .attr('text-anchor', 'left')
            .attr('font-weight', 'bolder')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            .classed('_3d', true)
            .merge(axisY)
            .transition().duration(500)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            .tween('axis-y', function(d) {
                let that = d3.select(this)
                let i = d3.interpolateString(that.text(), d.obj1)
                if (d.obj2 === 'Happiness.score') {
                    return t => {
                        that.text(i(t))
                    }
                } else {
                    return ''
                }
            })
        axisY.exit().remove()
    }
    // axis Y
    if (startAngle === -Math.PI/2) {
        axisY = cubes.merge(ce).selectAll('text.axis-y').data(d => {
            let _t = d.faces.filter(d => d.face === 'bottom')
            return [{obj1: d.obj1, obj2: d.obj2, centroid: _t[0].centroid}]
        })
        axisY.enter()
            .append('text')
            .attr('class', 'axis-y')
            .attr('dx', '3em')
            .attr('dy', '3px')
            .attr('text-anchor', 'left')
            .attr('font-weight', 'bolder')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            .classed('_3d', true)
            .merge(axisY)
            .transition().duration(500)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            .tween('axis-y', function(d) {
                let that = d3.select(this)
                let i = d3.interpolateString(that.text(), d.obj1)
                if (d.obj2 === 'Life.expectancy') {
                    return t => {
                        that.text(i(t))
                    }
                } else {
                    return ''
                }
            })
        axisY.exit().remove()
    }
    // axis X
    if (startAngle === -Math.PI*5/6) {
        axisX = cubes.merge(ce).selectAll('text.axis-x').data(d => {
            let _t = d.faces.filter(d => d.face === 'bottom')
            return [{obj1: d.obj1, obj2: d.obj2, centroid: _t[0].centroid}]
        })
        axisX.enter()
            .append('text')
            .attr('class', 'axis-x')
            .attr('dx', '3em')
            .attr('dy', '3px')
            .attr('text-anchor', 'left')
            .attr('font-weight', 'bolder')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            // .style('transform', 'translate(0,0) rotateY(20deg)')
            .classed('_3d', true)
            .merge(axisX)
            .transition().duration(500)
            .attr('fill', 'black')
            .attr('stroke', 'none')
            .attr('x', d => origin[0] + scale * d.centroid.x)
            .attr('y', d => origin[1] + scale * d.centroid.y)
            // .style('transform', 'translate(0,0) rotateY(90deg)')
            .tween('axis-x', function (d) {
                let that = d3.select(this)
                let i = d3.interpolateString(that.text(), d.obj2)
                if (d.obj1 === 'Life.expectancy') {
                    return t => {
                        that.text(i(t))
                    }
                } else {
                    return ''
                }
            })
        axisX.exit().remove()
    }
    // sort
    ce.selectAll('._3d').sort(d3._3d().sort)
    // tooltip
    let tooltip = d3.select('#tooltip-heat')
    let parent = document.getElementsByClassName('main-south-north')[0]
    // hover
    ce.on('mouseover', function(d) {
        d3.select(this).attr('opacity', 1)
        tooltip.html(createTooltipHeat(d))
            // .transition().duration(0)
            .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
            .style('margin-top', d3.mouse(parent)[1] + 845 + 'px')
            .style('display', 'block')
    })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 1)
            tooltip.html(createTooltipHeat(d))
                // .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 845 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this)
                // .transition().delay(100).duration(500)
                .attr('opacity', 0.9)
        })
    svg.on('mouseout', function() {
        tooltip
            // .transition().duration(500)
            .style('display', 'none')
    })
}

function initCubesData(correlation, header, j) {
    let cor = deepClone(correlation)
    cor = cor.map(d => d.map(dd => Number((dd * 10).toFixed(2))))
    let cubesData = []
    let counter = 0
    let h
    let _cube
    for(let z = -j; z <= j; z = z + 2){
        for(let x = -j; x <= j; x = x + 2){
            h = cor[x/2 + 5][z/2 + 5]
            _cube = makeCube(h, x, z)
            _cube.id = 'cube_' + counter++
            _cube.height = h
            _cube.value = Number(correlation[x/2 + 5][z/2 + 5])
            _cube.obj1 = header[x/2 + 5]
            _cube.obj2 = header[z/2 + 5]
            cubesData.push(_cube)
        }
    }
    return cubesData
}

function makeCube(h, x, z) {
    return [
        {x: x - 1, y: h, z: z + 1}, // FRONT TOP LEFT
        {x: x - 1, y: 0, z: z + 1}, // FRONT BOTTOM LEFT
        {x: x + 1, y: 0, z: z + 1}, // FRONT BOTTOM RIGHT
        {x: x + 1, y: h, z: z + 1}, // FRONT TOP RIGHT
        {x: x - 1, y: h, z: z - 1}, // BACK  TOP LEFT
        {x: x - 1, y: 0, z: z - 1}, // BACK  BOTTOM LEFT
        {x: x + 1, y: 0, z: z - 1}, // BACK  BOTTOM RIGHT
        {x: x + 1, y: h, z: z - 1}  // BACK  TOP RIGHT
    ]
}

function generateCorrelation(data) {
    let result = []
    let resRow
    for (let i = 0; i < data.length; i++) {
        resRow = []
        for (let j = 0; j < data.length; j++) {
            resRow.push(pearson(data[i], data[j]))
        }
        result.push(resRow)
    }
    result = result.map(d => d.map(dd => Number(dd.toFixed(4))))
    return result
}

function processDataHeat() {
    let result = []
    let columns = deepClone(project.data.list.columns)
    columns.splice(columns.indexOf('Region'), 1)
    columns.splice(columns.indexOf('Country'), 1)
    for (let i = 0; i < columns.length; i++) {
        result.push(project.data.list.map(d => d[columns[i]]))
    }
    result = result.map(d => d.map(dd => Number(dd)))
    return [result, columns]
}

function createTooltipHeat(d) {
    let parent = document.getElementById('tooltip-heat')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = `${d.obj1} and ${d.obj2} <br/>`
    parent.appendChild(text)
    text = document.createElement('p')
    text.innerHTML = `Correlation Coefficient: <span>${d.value}</span>`
    parent.appendChild(text)
    return parent.innerHTML
}