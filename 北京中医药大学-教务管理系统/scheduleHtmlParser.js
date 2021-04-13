/**
 * <p>Title: 北京中医药大学-教务管理系统</p>
 * <p>Description: 可使用正则匹配；可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9</p>
 *
 * @author  HaoNShi
 * @date    2021-2-21
 * @version 1.0
 */

/**
 * 解析周数
 *
 * @param  str 周数字符串
 * @return Array[]
 */
function parseWeeks(str) {
    let result = []
    // 截取“(周)”前的字符串
    let i = str.indexOf('(')
    let weeks = str.substring(0, i)
    let arr = weeks.split(',') // 逗号分隔周数片段
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
 * 解析课时
 *
 * @param  str 课时字符串
 * @return Array[{},{}]
 */
function parseSections(str) {
    let result = []
    // 截取“(周)[”后的字符串
    let i = str.indexOf('[')
    let len = str.length
    let weeks = str.substring(i + 1, len)
    let arr = weeks.split('-') // -分隔课时片段
    for (let j = 0; j < arr.length; j++) {
        let section = {}
        section.section = parseInt(arr[j])
        result.push(section)
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
    let result = []
    // 遍历所有含有课程信息的单元格
    $('#timetable').find('.kbcontent').each(function () {
        // 利用children()方法获取元素的所有子元素的集合
        // end()将匹配的元素变为前一次的状态
        let name = $(this).clone().children().remove().end().text()
        let nameList = name.split('---------------------')
        // 实际显示课程的单元格
        if (name.trim() !== '') {
            // 遍历单元格中的每节课程
            for (let i = 0; i < nameList.length; i++) {
                let teacher = $("[title='老师']", this).eq(i).text()
                let arrange = $("[title='周次(节次)']", this).eq(i).text()
                let position = $("[title='教室']", this).eq(i).text()
                let day = $(this).parents("tr").find("td").index($(this).parent()) + 1
                // 转换课程信息格式
                let weeks = parseWeeks(arrange)
                let sections = parseSections(arrange)
                // 记录新的课程信息
                let course = {}
                course.name = nameList[i]
                course.position = position
                course.teacher = teacher
                course.weeks = weeks
                course.day = day
                course.sections = sections
                result.push(course)
            }
        }

    })
    return result
}

/**
 * 输入课程页面的HTML字符串，提取课程信息，按约定的格式输出JSON字符串
 *
 * @param  html 上一步函数获取到的html
 * @return JSON{}
 */
function scheduleHtmlParser(html) {
    let course = parseCourse(html)
    return {courseInfos: course}
}