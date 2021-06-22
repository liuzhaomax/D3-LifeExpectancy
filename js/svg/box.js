/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 3:21
 * @version     v1.0
 * @filename    box.js
 * @description
 ***************************************************************************/

function createBox(attribute, order, selectedRC) {
    // remove all elements in svg
    document.getElementById('box').innerHTML = ''
    let group = 'Region'
    // data
    let unsortedData = d3.nest()
        .key(d => d[group])
        .rollup(d => {
            let q1 = Number(d3.quantile(d.map(dd => Number(dd[attribute])).sort(d3.ascending),0.25).toFixed(2))
            let median = Number(d3.quantile(d.map(dd => Number(dd[attribute])).sort(d3.ascending),0.5).toFixed(2))
            let q3 = Number(d3.quantile(d.map(dd => Number(dd[attribute])).sort(d3.ascending),0.75).toFixed(2))
            let interQuantileRange = Number((q3 - q1).toFixed(2))
            let min = Number((q1 - 1.5 * interQuantileRange).toFixed(2))
            let max = Number((q3 + 1.5 * interQuantileRange).toFixed(2))
            return({min: min, q1: q1, median: median, q3: q3, max: max, interQuantileRange: interQuantileRange})
        })
        .entries(project.data.list)
    let refData = quickSortByAttribute(project.data.listGroupByRegion, attribute, order)
    let sortedRegionArr = refData.map(d => d[group])
    let data = []
    for (let i = 0; i < sortedRegionArr.length; i++) {
        for (let j = 0; j < unsortedData.length; j++) {
            if (unsortedData[j].key === sortedRegionArr[i]) {
                data.push(unsortedData[j])
                break
            }
        }
    }
    let xData = data.map(d => d.value)
    let yData = data.map(d => d.key)
    // drawing
    let parent = document.getElementsByClassName('main-north-south-east')[0]
    let padding = {top: 20, right: 30, bottom: 20, left: 100}
    let width = parent.getBoundingClientRect().width - padding.left - 20, height = 240
    let xScale = d3.scaleLinear().domain([d3.min(xData.map(d => d.min)) - 10, d3.max(xData.map(d => d.max))]).rangeRound([0, width-74])
    let yScale = d3.scaleBand().domain(yData).rangeRound([0, height])

    let svg = d3.select('#box').attr('width', width + padding.left).attr('height', height + padding.bottom + padding.top).style('padding-top', '20px')
    let g = svg.append('g').attr('transform', 'translate(' + padding.left*1.7 + ',' + padding.top + ')')
    // title
    svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text(attribute + ' distribution per ' + group)
    // axis
    g.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(xScale).ticks(4))
    g.append('g').call(d3.axisLeft(yScale))

    // baseline
    let chart = g.selectAll('#box').data(data).enter().append('g')
    chart.append('line')
        .attr('y1', d =>(yScale(d.key) + yScale.bandwidth()/2))
        .attr('y2', d =>(yScale(d.key) + yScale.bandwidth()/2))
        .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
        .attr('x1', d =>(xScale(d.value.min)))
        .attr('x2', d =>(xScale(d.value.max)))
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
        .style('width', 40)
    // rectangle of each box
    chart.append('rect')
        .attr('y', d =>  yScale(d.key) + 2.5)
        .attr('height', yScale.bandwidth() - 5)
        .attr('x', d =>(xScale(d.value.q1)))
        .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
        .attr('width', d =>(xScale(d.value.q3) - xScale(d.value.q1)))
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
        .attr('fill', d => {
            if (selectedRC.has(d.key)) {
                return '#ffa200'
            } else {
                return '#54ba71'
            }
        })
        .attr('opacity', 1)
    // median
    chart.append('line')
        .attr('y1', d =>(yScale(d.key) + 2.5))
        .attr('y2', d =>(yScale(d.key) + yScale.bandwidth() - 3.5))
        .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
        .attr('x1', d =>(xScale(d.value.median)))
        .attr('x2', d =>(xScale(d.value.median)))
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
    // max
    chart.append('line')
        .attr('y1', d =>(yScale(d.key) + 2.5))
        .attr('y2', d =>(yScale(d.key) + yScale.bandwidth() - 3.5))
        .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
        .attr('x1', d =>(xScale(d.value.max)))
        .attr('x2', d =>(xScale(d.value.max)))
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
    // min
    chart.append('line')
        .attr('y1', d =>(yScale(d.key) + 2.5))
        .attr('y2', d =>(yScale(d.key) + yScale.bandwidth() - 3.5))
        .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
        .attr('x1', d =>(xScale(d.value.min)))
        .attr('x2', d =>(xScale(d.value.min)))
        .attr('stroke', 'black').attr('stroke-width', '1px')
        .attr('cursor', 'pointer')
    // click event
    chart.on('click', function (d) {
        project.status = 'Region'
        if (project.selectedRC.has(d.key)) {
            project.selectedRC.delete(d.key)
        } else {
            project.selectedRC.add(d.key)
        }
        displaySelectedRC()
        document.getElementsByClassName('btn-country')[0].classList.remove('btn-activated')
        document.getElementsByClassName('btn-region')[0].classList.add('btn-activated')
        createMap(project.status, project.attributes, project.selectedRC)
        createBar(project.status, project.attributes, project.order, project.selectedRC)
        createBox(project.attributes, project.order, project.selectedRC)
    })
    // tooltip
    let tooltip = d3.select('#tooltip-box')
    let tooltipLine = d3.select('#tooltip-box-line')
    let brotherWidth = document.getElementsByClassName('main-north-south-west')[0].getBoundingClientRect().width
    // hover
    toggleTooltipBox(chart, tooltip, parent, brotherWidth)
    // line
    if (project.status === 'Country' && selectedRC.size !== 0) {
        let lineData = project.data.list.filter(d => Array.from(selectedRC).indexOf(d['Country']) !== -1)
        let line = g.selectAll('#box').data(lineData).enter().append('g')
        line.append('line')
            .attr('y1', 0)
            .attr('y2', height)
            .transition().delay((d, i) => (i + 1) * 40).duration(300).ease(d3.easeBounceIn)
            .attr('x1', d => xScale(d[attribute]))
            .attr('x2', d => xScale(d[attribute]))
            .attr('stroke', '#ffa200').attr('stroke-width', 3)
            .attr('cursor', 'pointer')
        // hover
        toggleTooltipBoxLine(line, tooltipLine, parent, brotherWidth)
    }
    svg.on('mouseout', function() {
        tooltip.transition().duration(500).style('display', 'none')
        tooltipLine.transition().duration(500).style('display', 'none')
    })
}

function toggleTooltipBox(chart, tooltip, parent, width) {
    chart.on('mouseover', function(d) {
        d3.select(this).attr('opacity', 0.5)
        tooltip.html(createTooltipBox(d))
            .transition().duration(0)
            .style('margin-left', d3.mouse(parent)[0] + width + 3.5 * 2 + 30 + 'px')
            .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
            .style('display', 'block')
        })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 0.5)
            tooltip.html(createTooltipBox(d))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + width + 3.5*2 + 30 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this).transition().delay(100).duration(500).attr('opacity', 1.0)
        })
}

function toggleTooltipBoxLine(line, tooltip, parent, width) {
    line.on('mouseover', function(d) {
        d3.select(this).attr('opacity', 0.5)
        tooltip.html(createTooltipBoxLine(d))
            .transition().duration(0)
            .style('margin-left', d3.mouse(parent)[0] + width + 3.5 * 2 + 30 + 'px')
            .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
            .style('display', 'block')
        })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 0.5)
            tooltip.html(createTooltipBoxLine(d))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + width + 3.5*2 + 30 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this).transition().delay(100).duration(500).attr('opacity', 1)
        })
}

function createTooltipBoxLine(d) {
    let parent = document.getElementById('tooltip-box-line')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = d['Country']
    parent.appendChild(text)
    for (const key in d) {
        if (Object.prototype.hasOwnProperty.call(d, key)) {
            if (key !== 'Country' && key !== 'Region') {
                text = document.createElement('p')
                text.innerHTML = key + `: <span>${d[key]}</span>`
                parent.appendChild(text)
            }
        }
    }
    return parent.innerHTML
}

function createTooltipBox(d) {
    let parent = document.getElementById('tooltip-box')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = d.key
    parent.appendChild(text)
    for (const key in d.value) {
        if (Object.prototype.hasOwnProperty.call(d.value, key)) {
            text = document.createElement('p')
            text.innerHTML = key + `: <span>${d.value[key]}</span>`
            parent.appendChild(text)
        }
    }
    return parent.innerHTML
}