/**
 * <p>Title: 北京中医药大学-教务管理系统</p>
 * <p>Description: 输入课程页面的document对象，从页面中提取课程信息的HTML片段，输出HTML字符串</p>
 *
 * @author  史浩楠
 * @date    2021-2-21
 * @version 1.0
 */
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    // 请求课表页面
    let http = new XMLHttpRequest()
    http.open('GET', '/jsxsd/xskb/xskb_list.do', false)  // 使用同步方法
    http.send()

    // 返回请求到的课表页面
    return http.responseText
}