/**
 * <p>Title: 南京大学-研究生选课</p>
 * <p>Description: 可使用正则匹配；可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9</p>
 *
 * @author  CodeLumos
 * @date    2020-11-30
 * @version 1.3.2
 */

/**
 * 解析周数
 *
 * @param  str 周数字符串
 * @return Array[]
 */
function parseWeeks(str) {
    let result = []
    let arr = str.split(',') // 逗号分隔周数片段
    for (let i = 0; i < arr.length; i++) {
        let part = arr[i]
        if (part.search("-") !== -1) { // x-x周的形式
            let begin = parseInt(part.split('-')[0])
            let end = parseInt(part.split('-')[1])
            for (let j = begin; j < end + 1; j++) {
                result.push(j)
            }
        } else { // x周的形式
            result.push(parseInt(part))
        }
    }
    return result
}

/**
 * 解析课程信息
 *
 * @param  html 课表html
 * @return Array[{},{}]
 */
function parseCourse(html) {
    const $ = cheerio.load(html, {decodeEntities: false}); // 避免中文乱码
    let course = []
    // 遍历所有含有课程信息的单元格div标签
    $('#wdkbTable > tbody > tr > td > div').each(function () {
        // 获取课程信息
        let raw_weeks = $(this).find("div:nth-child(1)").text()
        let raw_name = $(this).find("div:nth-child(2)").text()
        let teacher = $(this).find("div:nth-child(3)").text()
        let position = $(this).find("div:nth-child(4)").text()
        let day = $(this).parent().attr("data-week")
        let sections = $(this).parent().attr("data-begin-unit")
        // 转换课程信息格式
        let weeks = parseWeeks(raw_weeks)
        let name = raw_name.replace(/\(.*?\)/g, '') // 移除字符串中的所有()括号及其中的内容
        let token = name + weeks + day // 用来唯一标识一门课程信息
        // 判断是否记录过该门课程
        let flag = -1
        for (let i = 0; i < course.length; i++) {
            if (course[i].token === token) {
                flag = i
            }
        }
        if (flag === -1) {
            // 记录新的课程信息
            let obj = {
                name: name,
                position: position,
                teacher: teacher,
                weeks: weeks,
                day: day,
                sections: [sections],
                token: token
            }
            course.push(obj)
        } else {
            // 为已记录的课程补充课时信息
            course[flag].sections.push(sections)
        }
    })
    return course
}

/**
 * 解析课时信息
 *
 * @param  html 课表html
 * @return Array[{},{}]
 */
function parseSection(html) {
    let result = []
    let i = 0
    // 遍历所有课程单元格
    $('#wdkbTable').find('tr').each(function () {
        let time = $(this).find("td:nth-child(2)").text()
        if (i !== 0) {
            let section = {}
            section.section = i
            section.startTime = time.split('~')[0]
            section.endTime = time.split('~')[1]
            result.push(section)
        }
        i++
    })
    return result
}

/**
 * 转换课时信息为约定的JSON格式
 *
 * @param  array 课时列表
 * @return Array[]
 */
function sectionsFormat(array) {
    let result = []
    for (let i = 0; i < array.length; i++) {
        result.push({section: array[i]})
    }
    return result
}

/**
 * 转换课程信息为约定的JSON格式
 *
 * @param  list 课程信息列表
 * @return Array[]
 */
function courseFormat(list) {
    let result = []
    for (let i = 0; i < list.length; i++) {
        let course = {}
        course.name = list[i].name
        course.position = list[i].position
        course.teacher = list[i].teacher
        course.weeks = list[i].weeks
        course.day = list[i].day
        course.sections = sectionsFormat(list[i].sections)
        result.push(course)
    }
    return result
}

/**
 * 输入课程页面的HTML字符串，提取课程信息，按约定的格式输出JSON字符串
 *
 * @param  html 上一步函数获取到的html
 * @return JSON{}
 */
function scheduleHtmlParser(html) {
    let raw_course = parseCourse(html)
    let course = courseFormat(raw_course)
    let section = parseSection(html)
    return {courseInfos: course, sectionTimes: section}
}