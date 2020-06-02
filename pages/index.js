import React from 'react'
import Link from 'next/link'
import Sanity from '../sanity-client.js'
import Favicon from 'react-favicon'
import Router from 'next/router'

import Header from '../components/Header.js'
import Carousel from '../components/Carousel.js'
import DocumentList from '../components/DocumentList.js'
import Footer from '../components/Footer.js'

import { sortByTimeDelta } from '../helperFunctions.js'

const BlockContent = require('@sanity/block-content-to-react')

const getData = async function(){
  // Get announcements and events to display on page
  var currentDate = (new Date()).toISOString()
  var query = `*[(_type == "event" && date >= "${currentDate}")]`
  var data = await Sanity.fetch(query, {})
  // Sort data by timeDelta value in ascending order
  var sortedData = sortByTimeDelta(data)

  // Get blockContent
  var query = `*[_type == "homepage"][0] | order(_updatedAt desc)`
  var blockContent = await Sanity.fetch(query, {})

  // Get BoardMembers
  var query = `*[_type == "boardmember"] | order(order asc, lastName asc)`
  var boardMembers = await Sanity.fetch(query, {})

  // Get aboutBlockContent
  var query = `*[_type == "aboutpage"][0] | order(_updatedAt desc)`
  var aboutBlockContent = await Sanity.fetch(query, {})

  return {data: sortedData, blockContent: blockContent, boardMembers: boardMembers, aboutBlockContent: aboutBlockContent}
}

class Index extends React.Component {
  state = {
    page: "index"
  }
  constructor(props){
    super(props)
    this.componentDidMount = this.componentDidMount.bind(this);
    Router.events.on('hashChangeStart', this.componentDidMount)
    Router.events.on('routeChangeStart', this.componentDidMount)
  }
  componentDidMount(){
    if(Router.asPath == "/" || Router.asPath == "/#"){
      this.setState({page: "index"})
    }
    else if(Router.asPath.match(/(about)/gi ) || Router.asPath.match(/#(about)/gi )){
      this.setState({page: "about"})
    }
  }
  render(){
    // If #about not in path
    if(this.state.page == "index"){
      // Render index
      var Events = this.props.data.filter(obj => {
        return obj._type === "event"
      })
      for(var event of Events){
        if(event.hasOwnProperty("enddate")){
          if(event.hasOwnProperty("hideTime") && event.hideTime){
            var readableStart = (new Date(event.date)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric'})
            var readableEnd = (new Date(event.enddate)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric'})
          }
          else {
            var readableStart = (new Date(event.date)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric', hour: '2-digit', minute:'2-digit'})
            var readableEnd = (new Date(event.enddate)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric', hour: '2-digit', minute:'2-digit'})
          }
          event.readableDate = readableStart + " – " + readableEnd
        }
        else {
          if(event.hasOwnProperty("hideTime") && event.hideTime){
            event.readableDate = (new Date(event.date)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric'})
          }
          else {
            event.readableDate = (new Date(event.date)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric', hour: '2-digit', minute:'2-digit'})
          }
        }
        event.readablePrice = (event.price == 0) ? '' : ("$" + event.price)
      }
      var Announcements = this.props.data.filter(obj => {
        return obj._type === "announcement"
      })
      for(var announcement of Announcements){
        announcement.readableDate = (new Date(announcement._createdAt)).toLocaleString([], {year:'numeric', month: '2-digit', day:'numeric', hour: '2-digit', minute:'2-digit'})
      }
      return(
        <div>
          <title>PDP</title>
          <Favicon url={"../static/favicon.ico"}/>
          <Header CurrentPage="Home"/>
          <Carousel data={this.props.data}/>
          {this.props.blockContent == null ? "" :
            <div id="AboutContainer">
              <div id="MissionStatement">
                <BlockContent id="BlockContent" blocks={this.props.blockContent.body} projectId="ocpl5ulk" dataset="pdp-data" />
              </div>
            </div>
          }
          <div id="Lists">
            <div id="Upcoming">
              <DocumentList data={Events} headline={"title"} primaryDetail={"readableDate"} secondaryDetail={"readablePrice"} image={"image"} maxLength={3} body="Description"/>
            </div>
          </div>
          <Footer/>
          <style jsx global>{`
            a:hover {
              text-decoration: none !important;
            }
  
            #hiddenDataContainer {
              display: none;
            }
  
            #AboutContainer {
              max-width: 60%;
              min-width: 800px;
              margin: 0 auto;
            }
  
            #AboutContainer #MissionStatement {
              background-color: #eee;
              width: 100%;
              max-width: 920px;
              margin: 30px auto;
              color: #333;
              text-align: center;
              padding: 20px 15px;
              padding-bottom: 3px;
            }
  
            #AboutContainer #MissionStatement p {
              line-height: 22px;
              font-weight: 400;
              font-size: 18px;
            }
  
            #AboutContainer #MissionStatement h3 {
              font-size: 22px;
              text-transform: uppercase;
              font-weight: 700;
              line-height: 20px;
            }
  
            #Upcoming, #Announcements {
              width: calc(60% - 70px);
              min-width: 600px;
              margin: 0 auto;
            }
  
            #Upcoming #UpcomingHeader, #Upcoming #AnnouncementsHeader, #Announcements #UpcomingHeader, #Announcements #AnnouncementsHeader {
              font-weight: 700;
              margin-bottom: 20px;
            }
  
            @media (max-width: 800px) {
              #Upcoming, #Announcements {
                  width: calc(100% - 30px);
                  min-width: auto;
                  margin: 15px;
              }
              #Upcoming .DocumentListItem .DocumentListItemBody, #Announcements .DocumentListItem .DocumentListItemBody {
                  width: 100%;
                  max-height: none !important;
              }
              #Upcoming .DocumentListItem .DocumentListItemBody .DocumentListItemImage, #Announcements .DocumentListItem .DocumentListItemBody .DocumentListItemImage {
                  float: none !important;
                  width: 100% !important;
              }
              #Upcoming .DocumentListItem .DocumentListItemBody .DocumentListItemText, #Announcements .DocumentListItem .DocumentListItemBody .DocumentListItemText {
                  float: none !important;
                  width: 100% !important;
                  padding-left: 0px !important;
              }
              #Upcoming .DocumentListItem .DocumentListItemBody .DocumentListItemText div.DocumentListItemName div, #Announcements .DocumentListItem .DocumentListItemBody .DocumentListItemText div.DocumentListItemName div {
                  font-size: 18px !important;
                  white-space: normal;
              }
              #Upcoming .DocumentListItem .DocumentListItemBody .DocumentListItemText .DocumentListItemDescription, #Announcements .DocumentListItem .DocumentListItemBody .DocumentListItemText .DocumentListItemDescription {
                  padding-left: 3px;
                  margin-bottom: 0px !important;
              }
              #CarouselContainer {
                  max-width: 100% !important;
                  min-width: auto !important;
                  margin-bottom: 0px;
              }
              #AboutContainer {
                  max-width: 100% !important;
                  min-width: auto !important;
              }
            }
  
            @media (max-width: 650px) {
              #CarouselContainer {
                  margin-top: 30px !important;
              }
            }
  
          `}</style>
        </div>
      )
    }
    // If #about in path
    else {
      var BoardMembers = this.props.boardMembers.map((itemData) => (
        <li>{
          itemData.hasOwnProperty("url") && itemData.url != "" ?
          <a href={itemData.url}>
            {(itemData.firstName + " " + itemData.lastName + ((typeof itemData.role !== "undefined" && itemData.role != "") ? (", " + itemData.role) : ("")))}
          </a>
          :
          (itemData.firstName + " " + itemData.lastName + ((typeof itemData.role !== "undefined" && itemData.role != "") ? (", " + itemData.role) : ("")))
        }</li>
      ))
      return (
        <div id="body">
          <title>PDP - About Us</title>
          <Favicon url={"../static/favicon.ico"}/>
          <Header CurrentPage="About"/>
          {this.props.aboutBlockContent == null ? "" :
            <div id="MissionContainer">
              <div id="MissionStatement">
                <BlockContent id="BlockContent" blocks={this.props.aboutBlockContent.body} projectId="ocpl5ulk" dataset="pdp-data" />
              </div>
            </div>
          }
          <div id="BoardMembers">
            <h3>Board of Directors</h3>
            <ul>
              {BoardMembers}
            </ul>
          </div>
          <Footer/>
          <style jsx global>{`
            * {
              -webkit-font-smoothing: antialiased !important;
            }
  
            #MissionContainer {
              max-width: 100%;
              width: 800px;
              margin: 0 auto;
            }
  
            #MissionContainer #MissionStatement {
              background-color: #eee;
              width: 100%;
              max-width: 920px;
              margin: 30px auto;
              color: #333;
              text-align: center;
              padding: 20px 15px;
              padding-bottom: 3px;
            }
  
            #MissionStatement img {
              max-width: 100%;
            }
  
            #BoardMembers {
              padding: 20px;
            }
  
            #BoardMembers h3 {
              text-align: center;
              font-weight: 700;
              font-size: 24px;
            }
  
            #BoardMembers ul {
              list-style: none;
              text-align: center;
              padding-left: 0px;
            }
  
            #BoardMembers ul li {
              font-size: 22px;
              font-weight: 400;
              line-height: 32px;
            }
  
          `}</style>
        </div>
      )
    }
  }
}

Index.getInitialProps = getData

export default Index;
