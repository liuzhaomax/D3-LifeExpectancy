/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 3:20
 * @version     v1.0
 * @filename    bar.js
 * @description
 ***************************************************************************/

function createBar(group, attribute, order, selectedRC) {
    // remove all elements in svg
    document.getElementById('bar').innerHTML = ''
    // data
    let data
    let height
    if (group === 'Country') {
        data = quickSortByAttribute(project.data.list, attribute, order)
        height = 2562
    } else if (group === 'Region') {
        data = quickSortByAttribute(project.data.listGroupByRegion, attribute, order)
        height = 240
    }
    if (selectedRC.size !== 0 && group === 'Country') {
        let selectedCountries = []
        Array.from(selectedRC).map(d => {
            data.map(dd => {
                if (d === dd[group]) {
                    selectedCountries.push(dd) // push address
                }
            })
        })
        for (let i = 0; i < selectedCountries.length; i++) {
            data.remove(selectedCountries[i])
        }
        selectedCountries = quickSortByAttribute(selectedCountries, attribute, order)
        data = selectedCountries.concat(data)
    }
    let xData = data.map(d => {return Number(d[attribute])})
    let yData = data.map(d => {return d[group]})
    // drawing
    let parent = document.getElementsByClassName('main-north-south-west')[0]
    parent.scrollTop = 0
    let padding = {top: 20, right: 30, bottom: 20, left: 100}
    let width = parent.getBoundingClientRect().width - padding.left - 20
    let xScale = d3.scaleLinear().domain([d3.min(xData) - 10, d3.max(xData)]).rangeRound([0, width-74])
    let yScale = d3.scaleBand().domain(yData).rangeRound([0, height])

    let svg = d3.select('#bar').attr('width', width + padding.left).attr('height', height + padding.bottom).style('padding-top', '20px')
    let g = svg.append('g').attr('transform', 'translate(' + padding.left*1.7 + ',' + padding.top + ')')
    // title
    svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text(attribute + ' grouped by ' + group)
    // axis Y
    g.append('g').call(d3.axisLeft(yScale))

    // rect
    let chart = g.selectAll('#bar').data(data).enter().append('g')
    chart.append('rect')
        .attr('x', d => xScale(xScale.domain()[0]) + 5)
        .attr('y', d => yScale(d[group]))
        .attr('cursor', 'pointer')
        .attr('fill', d => {
            if (selectedRC.has(d[group])) {
                return '#ffa200'
            } else {
                return 'steelblue'
            }
        })
        .attr('stroke', '#FFF').attr('stroke-width', '3px')
        .transition().delay((d, i) => (i + 1) * 5).duration(300).ease(d3.easeBounceIn)
        .attr('width', d => xScale(d[attribute]))
        .attr('height', yScale.bandwidth())
    // text of each rect
    chart.append('text').attr('fill', '#FFF')
        .attr('y', d => yScale(d[group]))
        .attr('x', d => xScale(xScale.domain()[0]))
        .transition().delay((d, i) => (i + 1) * 5)
        .duration(100).ease(d3.easeBounceIn)
        .attr('dx', d => xScale(d[attribute]) - 33)
        .attr('dy', d => {
            if (group === 'Region') {
                return yScale(d[group]) % 24 + 16
            } else if (group === 'Country') {
                return yScale(d[group]) % 14 + 12
            }
        })
        .attr('cursor', 'pointer')
        .text(d => d[attribute])
    // click event
    chart.on('click', function (d) {
        if (project.selectedRC.has(d[group])) {
            project.selectedRC.delete(d[group])
        } else {
            project.selectedRC.add(d[group])
        }
        displaySelectedRC()
        createMap(project.status, project.attributes, project.selectedRC)
        createBar(project.status, project.attributes, project.order, project.selectedRC)
        createBox(project.attributes, project.order, project.selectedRC)
    })
    // tooltip
    let tooltip = d3.select('#tooltip-bar')
    // hover
    chart.on('mouseover', function(d) {
            d3.select(this).attr('opacity', 0.5)
            tooltip.html(createTooltipBar(d, group))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + 30 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
                .style('display', 'block')
        })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 0.5)
            tooltip.html(createTooltipBar(d, group))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + 30 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 545 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this).transition().delay(100).duration(500).attr('opacity', 1.0)
        })
        svg.on('mouseout', function() {
            tooltip.transition().duration(500).style('display', 'none')
        })
}

function createTooltipBar(d, group) {
    let parent = document.getElementById('tooltip-bar')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = d[group]
    parent.appendChild(text)
    for (const key in d) {
        if (key !== 'Country' && key !== 'Region') {
            if (Object.prototype.hasOwnProperty.call(d, key)) {
                text = document.createElement('p')
                if (d[key] === '0') {
                    text.innerHTML = key + `: <span>No Data</span>`
                } else {
                    text.innerHTML = key + `: <span>${d[key]}</span>`
                }
                parent.appendChild(text)
            }
        }
    }
    return parent.innerHTML
}
