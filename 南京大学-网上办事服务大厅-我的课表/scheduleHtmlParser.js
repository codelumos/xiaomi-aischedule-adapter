/**
 * <p>Title: 南京大学-网上办事服务大厅-我的课表</p>
 * <p>Description: 可使用正则匹配；可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9</p>
 *
 * @author  史浩楠
 * @date    2020-11-25
 * @version 1.0
 */

/**
 * 周数转换
 *
 * @param  String  str 周数字符串
 * @return Array[]
 */
function parseWeeks(str) {
    let result = []
    var arr = str.split(',') // 逗号分隔
    for(j = 0; j < arr.length; j++) {
        part = arr[j]
        if (part.search("-") != -1 ) { // x-x周的形式
            let begin = parseInt(part.split('-')[0])
            let end = parseInt(part.split('-')[1])
            for (let i = begin; i < end + 1; i++) {
                result.push(i)
            }
        } else { // x周的形式
            result.push(parseInt(part))
        }
    }
    return result
}

/**
 * 课时转换
 *
 * @param  Array[] array 课时列表
 * @return Array[]
 */
function parseSections(array) {
    let result = []
    for (var i = 0; i < array.length; i++) {
        result.push({ section: array[i] })
    }
    return result
}

/**
 * 课程信息JSON转换
 *
 * @param  Object[] list 课程信息列表
 * @return JSON
 */
function course2JSON(list) {
    let result = []
    for (var i = 0; i < list.length; i++) {
        let course = {}
        course.name = list[i].name
        course.position = list[i].position
        course.teacher = list[i].teacher
        course.weeks = list[i].weeks
        course.day = list[i].day
        course.sections = parseSections(list[i].sections)
        result.push(course)
    }
    return result
}

/**
 * 解析课程信息
 *
 * @param  String   html 课表html
 * @return Object[]
 */
function parseCourse(html) {
    const $ = cheerio.load(html, { decodeEntities: false });
    let course = []
    // 遍历所有课程单元格
    $('#jsTbl_01').find('.arrage').each(function() {
        // 存在课程的单元格
        if ($(this).parent().css('display') != 'none') {
            // 获取课程信息
            var raw_weeks = $(this).find("div:nth-child(1)").text()
            var raw_name = $(this).find("div:nth-child(2)").text()
            var teacher = $(this).find("div:nth-child(3)").text()
            var position = $(this).find("div:nth-child(4)").text()
            var day = $(this).parent().attr("xq")
            var sectionBegin = $(this).parent().attr("jcxq").split('-')[0]
            var sectionLength = $(this).parent().attr("rowspan")
            if (sectionLength == null) {
                sectionLength = 1
            }
            var sections = []
            for (let i = 0; i < sectionLength; i++) {
                sections.push(parseInt(sectionBegin) + i)
            }
            // 转换课程信息格式
            var weeks = parseWeeks(raw_weeks)
            var name = raw_name.replace(/\(.*?\)/g,'') // 移除字符串中的所有()括号（包括其内容）
            // 判断是否记录过该门课程
            var flag = -1
            for (var i = 0; i < course.length; i++) {
                if (course[i].token == name + weeks + day) {
                    flag = i
                }
            }
            if (flag == -1) {
                // 记录新的课程信息
                var obj = {
                    name: name,
                    position: position,
                    teacher: teacher,
                    weeks: weeks,
                    day: day,
                    sections: sections,
                    token: name + weeks + day
                }
                course.push(obj)
            } else {
                // 为已记录的课程补充课时信息
                $.merge(course[flag].sections, sections)
            }
        }
    })
    return course
}

/**
 * 解析课时信息
 *
 * @param  String  html 课表html
 * @return JSON
 */
function parseSection(html) {
    let result = []
    var i = 0
    // 遍历所有课程单元格
    $('#jsTbl_01').find('tr').each(function() {
        var time = $(this).find("td:nth-child(2)").text()
        if (i != 0) {
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
 * 输入课程页面的HTML字符串，提取课程信息，按约定的格式输出JSON
 *
 * @param  String html 上一步函数获取到的html
 * @return JSON
 */
function scheduleHtmlParser(html) {
    let raw_course = []
    let course = []
    let section = []
    raw_course = parseCourse(html)
    course = course2JSON(raw_course)
    section = parseSection(html)
    return { courseInfos: course, sectionTimes: section }
}