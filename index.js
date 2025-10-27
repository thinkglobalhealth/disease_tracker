import '../../common/styles/styles-tailwind.scss';
import '../../common/styles/fonts.scss';
import './styles.scss';

import './node_modules/choices.js/public/assets/styles/choices.min.css'

window.$ = window.jQuery = require('jquery')

import * as datacountries from './geojson/ne_10m_admin_0_countries_simple.json'
import * as datalakes from './geojson/lakes.json'
import * as masterBounds from './geojson/bounds.json'

const d3 = Object.assign({}, require('d3-shape'), require('d3-format'), require('d3-selection'), require('d3-scale'), require('d3-zoom'), require('d3-geo'), require('d3-geo-projection'), require('d3-svg-legend'), require('d3-geo-scale-bar'), require('d3-svg-annotation'),require('d3-collection'),require('d3-array'),require('d3-transition'),require('d3-time-format'))

require('webpack-jquery-ui') //slider?
require('jquery-ui-touch-punch') // touch support

var realtimeData = require('./data/tracker2.csv');
var historicalData = require('./data/combined_data.csv');

let historicalSliderValues = [...new Set(
  historicalData.map(d => +d.year)
)].sort((a, b) => a - b);

console.log('Historical slider values:', historicalSliderValues);

const topojson = require('topojson-client')

let countryLookup = {
  'AF': 'Afghanistan', 'AX': 'Aland Islands', 'AL': 'Albania', 'DZ': 'Algeria', 'AS': 'American Samoa', 'AD': 'Andorra', 'AO': 'Angola', 'AI': 'Anguilla', 'AQ': 'Antarctica', 'AG': 'Antigua and Barbuda', 'AR': 'Argentina', 'AM': 'Armenia', 'AW': 'Aruba', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan', 'BS': 'Bahamas', 'BH': 'Bahrain', 'BD': 'Bangladesh', 'BB': 'Barbados', 'BY': 'Belarus', 'BE': 'Belgium', 'BZ': 'Belize', 'BJ': 'Benin', 'BM': 'Bermuda', 'BT': 'Bhutan', 'BO': 'Bolivia', 'BQ': 'Bonaire', 'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana', 'BR': 'Brazil', 'IO': 'British Indian Ocean Territory', 'BN': 'Brunei', 'BG': 'Bulgaria', 'BF': 'Burkina Faso', 'BI': 'Burundi', 'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada', 'CV': 'Cape Verde', 'KY': 'Cayman Islands', 'CF': 'Central African Republic', 'TD': 'Chad', 'CL': 'Chile', 'CN': 'China', 'CX': 'Christmas Island', 'CO': 'Colombia', 'KM': 'Comoros', 'CK': 'Cook Islands', 'CR': 'Costa Rica', 'HR': 'Croatia', 'CU': 'Cuba', 'CW': 'Curacao', 'CY': 'Cyprus', 'CZ': 'Czech Republic', 'CD': 'Democratic Republic of Congo', 'DK': 'Denmark', 'DJ': 'Djibouti', 'DM': 'Dominica', 'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt', 'SV': 'El Salvador', 'GQ': 'Equatorial Guinea', 'ER': 'Eritrea', 'EE': 'Estonia', 'SZ': 'Eswatini', 'ET': 'Ethiopia', 'FK': 'Falkland Islands', 'FO': 'Faroe Islands', 'FJ': 'Fiji', 'FI': 'Finland', 'FR': 'France', 'GF': 'French Guiana', 'PF': 'French Polynesia', 'TF': 'French Southern and Antarctic Lands', 'GA': 'Gabon', 'GM': 'Gambia', 'GE': 'Georgia', 'DE': 'Germany', 'GH': 'Ghana', 'GI': 'Gibraltar', 'GR': 'Greece', 'GL': 'Greenland', 'GD': 'Grenada', 'GP': 'Guadeloupe', 'GU': 'Guam', 'GT': 'Guatemala', 'GG': 'Guernsey', 'GN': 'Guinea', 'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti', 'HM': 'Heard Island and McDonald Islands', 'HN': 'Honduras', 'HK': 'Hong Kong', 'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia', 'IR': 'Iran', 'IQ': 'Iraq', 'IE': 'Ireland', 'IM': 'Isle of Man', 'IL': 'Israel', 'IT': 'Italy', 'CI': 'Ivory Coast', 'JM': 'Jamaica', 'JP': 'Japan', 'JE': 'Jersey', 'JO': 'Jordan', 'KZ': 'Kazakhstan', 'KE': 'Kenya', 'KI': 'Kiribati', 'XK': 'Kosovo', 'KW': 'Kuwait', 'KG': 'Kyrgyzstan', 'LA': 'Laos', 'LV': 'Latvia', 'LB': 'Lebanon', 'LS': 'Lesotho', 'LR': 'Liberia', 'LY': 'Libya', 'LI': 'Liechtenstein', 'LT': 'Lithuania', 'LU': 'Luxembourg', 'MO': 'Macau', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives', 'ML': 'Mali', 'MT': 'Malta', 'MH': 'Marshall Islands', 'MQ': 'Martinique', 'MR': 'Mauritania', 'MU': 'Mauritius', 'YT': 'Mayotte', 'MX': 'Mexico', 'FM': 'Micronesia', 'MD': 'Moldova', 'MC': 'Monaco', 'MN': 'Mongolia', 'ME': 'Montenegro', 'MS': 'Montserrat', 'MA': 'Morocco', 'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia', 'NR': 'Nauru', 'NP': 'Nepal', 'NL': 'Netherlands', 'NC': 'New Caledonia', 'NZ': 'New Zealand', 'NI': 'Nicaragua', 'NE': 'Niger', 'NG': 'Nigeria', 'NU': 'Niue', 'NF': 'Norfolk Island', 'KP': 'North Korea', 'MK': 'North Macedonia', 'MP': 'Northern Mariana Islands', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan', 'PW': 'Palau', 'PS': 'Palestinian territories', 'PA': 'Panama', 'PG': 'Papua New Guinea', 'PY': 'Paraguay', 'PE': 'Peru', 'PH': 'Philippines', 'PN': 'Pitcairn Islands', 'PL': 'Poland', 'PT': 'Portugal', 'PR': 'Puerto Rico', 'QA': 'Qatar', 'CG': 'Republic of Congo', 'RE': 'Reunion', 'RO': 'Romania', 'RU': 'Russia', 'RW': 'Rwanda', 'BL': 'Saint Barthelemy', 'SH': 'Saint Helena, Ascension, and Tristan da Cunha', 'KN': 'Saint Kitts and Nevis', 'LC': 'Saint Lucia', 'MF': 'Saint Martin', 'PM': 'Saint Pierre and Miquelon', 'VC': 'Saint Vincent and the Grenadines', 'WS': 'Samoa', 'SM': 'San Marino', 'ST': 'Sao Tome and Principe', 'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SC': 'Seychelles', 'SL': 'Sierra Leone', 'SG': 'Singapore', 'SX': 'Sint Maarten', 'SK': 'Slovakia', 'SI': 'Slovenia', 'SB': 'Solomon Islands', 'SO': 'Somalia', 'ZA': 'South Africa', 'GS': 'South Georgia and the South Sandwich Islands', 'KR': 'South Korea', 'SS': 'South Sudan', 'ES': 'Spain', 'LK': 'Sri Lanka', 'SD': 'Sudan', 'SR': 'Suriname', 'SJ': 'Svalbard', 'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syria', 'TW': 'Taiwan', 'TJ': 'Tajikistan', 'TZ': 'Tanzania', 'TH': 'Thailand', 'TL': 'Timor-Leste', 'TG': 'Togo', 'TK': 'Tokelau', 'TO': 'Tonga', 'TT': 'Trinidad and Tobago', 'TN': 'Tunisia', 'TR': 'Turkey', 'TM': 'Turkmenistan', 'TC': 'Turks and Caicos Islands', 'TV': 'Tuvalu', 'UG': 'Uganda', 'UA': 'Ukraine', 'AE': 'United Arab Emirates', 'GB': 'United Kingdom', 'US': 'United States', 'UY': 'Uruguay', 'UZ': 'Uzbekistan', 'VU': 'Vanuatu', 'VA': 'Vatican City', 'VE': 'Venezuela', 'VN': 'Vietnam', 'VG': 'Virgin Islands (British)', 'VI': 'Virgin Islands (US)', 'WF': 'Wallis and Futuna', 'EH': 'Western Sahara', 'YE': 'Yemen', 'ZM': 'Zambia', 'ZW': 'Zimbabwe'
}

let Choices = require('choices.js')

let project = 'global_energy_tracker_map'

let countryFill = ''
let title = ''
let note = 'Realtime (monthly) alerts are sourced from news and official sources, reviewed by ProMED staff. Associated case counts are approximate based on alert content and cover different time periods. Open circles denote alerts where no case count is available. Historical (yearly) alerts are from the World Health Organization.<br><br>Map: CFR/Allison Krugman • Source: ProMED, WHO Joint Reporting Form'
let sources = ''
let source = ''
let subtitle = ''

let f = d3.format('.2f')

let chart1 = `
<div id='chart1' >
<div id='v-${project}' class='chartDiv relative'>
        <div class='v-legend-container'>
            <div class='v-legend-desktop-container'></div>
        </div>
        <div class='controls'>
            <button id='zoom_in'>+</button>
            <button id='zoom_out'>-</button>
        </div>
    </div>
</div>`

let footer = `
    <div class='v-footer' style='font-family: larsseit_regular !important; letter-spacing: 0.5px; color: #999;'>
        <div style='font-family: inherit; color: inherit;'>
            <div id='note' class='v-annotation' style='font-family: inherit; color: inherit !important;'>${note}</div>
            <div style='display: flex; justify-content: space-between; align-items: center; position: relative; font-family: inherit;'>
                <div class='src' style='font-family: inherit; color: inherit !important;'>
                    <span class='v-source' style='font-family: inherit; color: inherit !important;'>
                        <span id='psource' class='v-source' style='font-family: inherit; color: inherit !important;'>${sources}</span> : 
                        <span id='vsource' class='v-source' style='font-family: inherit; color: inherit !important;'>${source}</span>
                    </span>
                </div>
                <div class='v-logo-brown' style='background-image: url(https://raw.githubusercontent.com/alliekrugman/disease_tracker/main/global_energy_tracker_map/tgh_logo.png); width: 101px; height: 10px; background-size: 101px 10px;'></div>
            </div>
        </div>
    </div>`;

let graphic = `
<div class='vallenato' style='max-width:994px'>
    <div class='v-header'>
        <div class='v-title'>${title}</div>
        <div class='v-subhead' style='padding-top:6px'>${subtitle}</div>
        <div>
         <div class='v-legend-medium-container flex justify-between' style='width:100%;'>
        <div class='p-4 toggleTool' style='width:200px'>
            <label for="disease-select"></label>
            <select name="disease" id="disease-select">
            </select>
        </div>

        <div class='p-4 toggleTool' style='max-width:292px;width:100%'>
            <label for="type-select"></label>
            <select name="type" id="type-select">
            </select>
        </div>
        <div class="tool pl-4px toggleTool" style='width:265px;left:0px'>
        <div id="dsliderposition"><div id="dslider"><div id="custom-handle" class="ui-slider-handle"><p id="slider-text"></p></div></div></div>
        </div>
        </div>
        </div>
        
        <div class='v-legend w-full' style='padding-top:24px'>
        
            <div class='v-legend-mobile-container'></div>
        </div>
    </div>
    <div class='graphic_container relative'>
        <div class='dataviz' id='mapchart' style='height:fit-content'>
            ${chart1}
            
        </div>  <!--map-->
            <!--${footer}-->
        </div> <!--dataviz-->
    </div> <!--graphic container-->
</div> <!--vallenato-->

`
document.querySelector(`#${project}`).innerHTML = graphic

const state = {
  selectedMapType: 'realtime',
  selectedDisease: 'total',
  selectedDate: '2021',
  selectedFilters: []
};

// Pre-calculate max values by disease for consistent scaling
// Single max for all historical data
const historicalOverallMax = d3.max(historicalData, d => +d.cases);

let typeList = state.selectedMapType === 'historical' 
  ? ['Measles', 'Mumps', 'Polio', 'Whooping Cough']
  : ['Total', 'Measles', 'Mumps', 'Polio', 'Whooping Cough', 'Respiratory Syncytial Virus', 'Diphtheria', 'Chicken Pox', 'Hepatitis A', 'Hepatitis B'];
let dropdown1 = document.querySelector(`#${project} .v-legend-medium-container select#disease-select`);
let dropdown2 = document.querySelector(`#${project} .v-legend-medium-container select#type-select`);

const choices1 = new Choices(dropdown1,{searchEnabled:false, itemSelectText:''});
const choices2 = new Choices(dropdown2,{searchEnabled:false, itemSelectText:''})

let nameLookup = {
  'Total':'All Diseases', 
  'Measles':'Measles', 
  'Mumps':'Mumps', 
  'Polio':'Polio', 
  'Whooping Cough':'Whooping Cough',
  'Respiratory Syncytial Virus':'RSV',
  'Diphtheria':'Diphtheria',
  'Chicken Pox':'Chicken Pox',
  'Hepatitis A':'Hepatitis A',
  'Hepatitis B':'Hepatitis B'
}
console.log('Unique diseases in historical data:', 
  [...new Set(historicalData.map(d => d.disease))]);

let options1 = typeList.map(x => ({value:x, label:nameLookup[x]}))

choices1.setValue(options1);
choices1.setChoiceByValue('Total')

let options2 = [
  { value: 'realtime', label: 'Monthly', disabled: false, selected: true },
  { value: 'historical', label: 'Yearly', disabled: false },
];

choices2.setChoices(options2)
choices2.setChoiceByValue('realtime')

let extent = topojson.feature(datacountries.default, datacountries.objects.ne_10m_admin_0_countries)
let myfeatures = topojson.feature(datacountries.default, datacountries.objects.ne_10m_admin_0_countries).features
let mylakes = topojson.feature(datalakes.default, datalakes.objects.lakes).features

extent = {type:'FeatureCollection', features : extent.features.filter(function (d, i) {
  // removes any country here
  if (d.properties.ISO_A2 !== 'AQ') { return d }
})}

//console.log(entries.filter(x => x.key == '1990'))
const mtooltip = d3.select(`#v-${project}`)
        .append('div')
        .style("pointer-events", "all")
        .style('display', 'none')
        .attr('class', 'mtooltip v-tooltip v-annotation').raise()

let height = (1024 * 535) / 1152 
let width = 1024
let projection = d3.geoMiller().fitExtent([[0, 0],[width, height]], extent)
let path = d3.geoPath(projection)

function zoomFunction () {
    if (jQuery('#mapchart').css('display') !== 'none') {
      mtooltip.style('display', 'none')
      var transform = d3.zoomTransform(this);
      var h = 0
      transform[0] = Math.min((width / height) * (transform.k - 1), Math.max(width * (1 - transform.k), transform[0]));
      transform[1] = Math.min(h * (transform.k - 1) + h * transform.k, Math.max(height * (1 - transform.k) - h * transform.k, transform[1]));
      group.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')')
    }
  }

  let zoom = d3.zoom()
  .scaleExtent([1, 4])
  .translateExtent([[0, 0], [width, height]])
  .on('zoom', zoomFunction);

  d3.select(`#${project} #zoom_in`).on('click', function () {
    zoom.scaleBy(svg.transition().duration(400), 2);
  });

  d3.select(`#${project} #zoom_out`).on('click', function () {
    zoom.scaleBy(svg.transition().duration(400), 0.5);
  });

  function redraw () {
  //let fd = data ? data : filter_data
  var width = jQuery(`#global_energy_tracker_map .vallenato`).width()
  var height = ((width * 535) / 1024 )
  if (width < 994){
    height = ((width * 535) / 1024 )
   //d3.select(`#${project}_legend`).attr("width", width).attr('height',height)
  }
  

    var windowWidth = jQuery(window).width()
    //console.log(windowWidth)
    if (windowWidth <= 680) {
      jQuery(`#${project} .v-legend-mobile-container`).show()
      jQuery(`#${project} .v-legend-desktop-container`).hide()
    } else {
      jQuery(`#${project} .v-legend-mobile-container`).hide()
      jQuery(`#${project} .v-legend-desktop-container`).show()
    }
  d3.select(`#${project}_map.svg-content`).attr("width", width).attr('height',height)
  
}

let svgLegend = d3.select(`#v-${project}`)
.append('svg')
.attr('width', width)
.attr('id',`${project}_legend`)
.attr('height', height)
.classed('absolute',true)
.style('bottom',0)
.style('pointer-events','none')

const svg = d3.select(`#v-${project}`).append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('id',`${project}_map`)
  .classed('svg-content', true)
  .call(zoom)
  .attr('viewBox', [0, 0, width, height])
  .attr('preserveAspectRatio', 'xMinYMin meet')
  //.on('wheel.zoom', null)
  //.on('dblclick.zoom', null);

d3.select(`#v-${project}`).append('div').html(footer);

let group = svg.append('g')

 countryFill = group.append('g')
 .attr('class', 'country-fill')
 .selectAll('path')
 .data(myfeatures)
 .enter().append('path')
 .attr('d', path)
 .attr('fill', '#f0f0f0')
 .attr('vector-effect', 'non-scaling-stroke')
 .attr('stroke-linejoin', 'round')
 .attr('class', 'country')
 .attr('id', function (d, i) {
   return d.properties.ISO_A2
 })

group.append('g')
 .attr('class', 'country-borders')
 .selectAll('path')
 .data(myfeatures)
 .enter().append('path')
 .attr('d', path)
 .attr('stroke-linejoin', 'round')
 .attr('vector-effect', 'non-scaling-stroke')
 .attr('stroke', '#ffffff')
 .attr('stroke-width', '0.35pt')

group.append('g')
 .attr('class', 'lakes-borders')
 .selectAll('path')
 .data(mylakes)
 .enter().append('path')
 .attr('vector-effect', 'non-scaling-stroke')
 .attr('stroke-linejoin', 'round')
 .attr('d', path);

var radiusScale = d3.scaleSqrt()
  .domain([0, d3.max(realtimeData, d => +d.cases)])
  .range([7, 70]); 
  
var diseaseColor = d3.scaleOrdinal()
  .domain(['Measles', 'Mumps', 'Chicken Pox', 'Polio', 'Whooping Cough', 'Respiratory Syncytial Virus', 'Diphtheria', 'Hepatitis A', 'Hepatitis B'])
  .range([
    '#F56647',  // Measles - red/orange
    '#04284A',  // Mumps - dark blue
    '#0C3F42',  // Chicken Pox - dark green
    '#6ba3e2',  // Polio - sky blue
    '#efd952',  // Whooping Cough - yellow
    '#dbb9e6',  // Respiratory Syncytial Virus (RSV) - pink/lavender
    '#7A8CA0',  // Diphtheria - lighter blue/indigo
    '#ae9c84',  // Hepatitis A - neutral/light gray-beige
    '#aebcc7'   // Hepatitis B - very light blue
  ])

state.selectedMapType = 'realtime';
state.selectedDisease = 'Total';

var symbolLayer = group.append('g')
  .attr('class', 'realtime-symbols');

function updateMap() {
    console.log('updateMap called - Mode:', state.selectedMapType, 'Disease:', state.selectedDisease, 'Date:', state.selectedDate);
    // Remove all circles first
    symbolLayer.selectAll('circle').remove();

    // Reset all countries to default color and clear event handlers
    countryFill
      .attr('fill', '#f0f0f0')
      .on('mouseover', null)  // Clear existing event handlers
      .on('mouseout', null)
      .on('mousemove', null);
    
    if (state.selectedMapType === 'realtime') {
      
      let allData = realtimeData.filter(d =>
        getMonthFormatted(d.date) === state.selectedDate
      );
      
      let filteredData = allData;
      if (state.selectedDisease !== 'Total') {
        filteredData = filteredData.filter(d => d.diseases === state.selectedDisease);
      }

      console.log('Unique diseases in filtered data:', [...new Set(filteredData.map(d => d.diseases))]);
      
      const validCoords = filteredData.filter(d => 
        d.lng && d.lat && !isNaN(+d.lng) && !isNaN(+d.lat)
      );

      validCoords.sort((a, b) => (+b.cases) - (+a.cases));

      let stickyTooltip = null;


      symbolLayer.selectAll('circle')
  .data(validCoords)
  .enter()
  .append('circle')
  .attr('cx', d => {
    const coords = projection([+d.lng, +d.lat]);
    return coords[0];
  })
  .attr('cy', d => projection([+d.lng, +d.lat])[1])
  .attr("r", d => radiusScale(+d.cases))
  .attr('fill', d => (+d.cases === 0) ? "#F2F2F2" : diseaseColor(d.diseases))
  .attr('fill-opacity', d => (+d.cases === 0) ? 0.1 : 0.7)
  .attr('stroke', d => (+d.cases === 0) ? diseaseColor(d.diseases) : '#333') // Disease color for 0 cases
  .attr('stroke-width', d => (+d.cases === 0) ? 2 : 0.1) // Thicker stroke for visibility

  .on('mouseover', function(d) {
  if (stickyTooltip === this) return;
  
  function casesText(count) {
    if (+count === 0) return 'Case count not specified'; // Changed message
    return count == 1 ? '1 case' : `${count} cases`;
  }

  const cases = casesText(d.cases);
  const casesDisplay = cases ? ` | ${cases}` : '';

  d3.select(this)
    .transition()
    .duration(100)
    .attr('stroke', '#000')                
    .attr('stroke-width', 1);


      function getFirstSentence(text) {
        if (!text) return '';
        
        const sentences = text.split(/[.!?]\s+/);
        return sentences[0] + (sentences.length > 1 ? '.' : '');
      }

      function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }

      function fixEncoding(text) {
        if (!text) return text;
        
        // Handle null/string literals
        if (text === 'null' || text === 'string') return '';
        
        const charMap = {
          // French/European characters
          '√©': 'é', '√®': 'è', '√¢': 'â', '√™': 'ù', '√¶': 'ô',
          '√ß': 'ç', '√≠': 'í', '√°': 'à', '√±': 'ñ', '√≥': 'ó',
          '√ú': 'ú', '√Ę': 'â', '√Ä': 'Ä', '√Ö': 'Ö', '√Ü': 'Ü',
          
          // Vietnamese characters
          'Háº£': 'Hải', 'háº£': 'hải',
          'DÆ°Æ¡': 'Dương', 'dÆ°Æ¡': 'dương',
          'Æ°': 'ư', 'Æ¡': 'ơ',
          'áº£': 'ả', 'áº¡': 'ạ', 'áº¿': 'ế', 'á»': 'ề',
          'á»': 'ễ', 'á»': 'ệ', 'á»': 'ố', 'á»': 'ồ',
          'á»': 'ổ', 'á»': 'ỗ', 'á»': 'ộ', 'á»': 'ú',
          'á»': 'ù', 'á»': 'ủ', 'á»': 'ũ', 'á»': 'ụ',
          
          // Spanish/Latin American characters  
          'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
          'Ã±': 'ñ', 'Ã¼': 'ü', 'Ã ': 'à', 'Ã¨': 'è', 'Ã¬': 'ì',
          'Ã²': 'ò', 'Ã¹': 'ù', 'Ã§': 'ç'
        };
        
        // Fix character encoding
        let fixed = Object.keys(charMap).reduce((text, char) => {
          return text.replace(new RegExp(char, 'g'), charMap[char]);
        }, text);
        
        // Split into parts and filter out bad values
        const parts = fixed.split(', ').filter(part => {
          const trimmed = part.trim();
          return trimmed !== '' && trimmed !== 'null' && trimmed !== 'string';
        });
        
        // Remove duplicate consecutive parts
        const uniqueParts = [];
        for (let i = 0; i < parts.length; i++) {
          if (i === 0 || parts[i] !== parts[i-1]) {
            uniqueParts.push(parts[i]);
          }
        }
        
        return uniqueParts.join(', ');
      }

      const tooltipHTML = `<div class="font-lb" style="color:#4B535D;padding-bottom:8px;font-weight:bold;">
  ${fixEncoding(d.place_name)}</div>
  <div style="margin-bottom:8px;">
  <strong><i>${formatDate(d.date)}</strong>${casesDisplay}</i></div>
  <div>${fixEncoding(getFirstSentence(d.summary))} <a href="${d.link}" target="_blank" style="pointer-events: all; z-index: 10000;">Read more</a></div>`;
    
        
    mtooltip
      .html(tooltipHTML)
      .style('position', 'absolute')
      .style('display', 'inline-block')
      .on('click', function(d) {
        d3.event.stopPropagation(); // Prevent click from bubbling to circle
      });

    handleMouseMove(d);
  })
  .on('mouseout', function(d) {
    const cases = (+d.cases === 0) ? '' : `${d.cases} cases`;
    const casesDisplay = cases ? ` | ${cases}` : '';
    if (stickyTooltip === this) return;
    
    d3.select(this).classed('highlight', false)
    .transition()
    .duration(100)
  .attr('fill', d => (+d.cases === 0) ? "#F2F2F2" : diseaseColor(d.diseases))
  .attr('fill-opacity', d => (+d.cases === 0) ? 0.1 : 0.7)
  .attr('stroke', d => (+d.cases === 0) ? diseaseColor(d.diseases) : '#333') // Disease color for 0 cases
  .attr('stroke-width', d => (+d.cases === 0) ? 2 : 0.1)
    
    mtooltip.style('display', 'none');
  })
  .on('mousemove', function(d) {
    // Don't move tooltip if it's sticky
    if (stickyTooltip === this) return;
    handleMouseMove(d);
  })
  .on('click', function(d) {
    if (stickyTooltip && stickyTooltip !== this) {
      d3.select(stickyTooltip)
        .classed('highlight', false)
        .transition()
        .duration(100)
        .attr('stroke', '#333')
        .attr('stroke-width', .5);
    }
    
    // Toggle sticky state
    if (stickyTooltip === this) {
      // Unstick current tooltip
      stickyTooltip = null;
      d3.select(this)
        .classed('highlight', false)
        .transition()
        .duration(100)
        .attr('stroke', '#333')
        .attr('stroke-width', .5);
      mtooltip.style('display', 'none');
    } else {
      // Make this tooltip sticky
      stickyTooltip = this;
      
      d3.select(this)
        .raise()
        .classed('highlight', true)
        .transition()
        .duration(100)
        .attr('stroke', '#000')
        .attr('stroke-width', 2); // Slightly thicker border for sticky state

        const tooltipHTML = `<div class="font-lb" style="color:#4B535D;padding-bottom:8px;font-weight:bold;">
        ${d.place_name}</div>
        <div style="margin-bottom:8px;">
        <strong><i>${formatDate(d.date)}</strong>${casesDisplay}</i></div>
        <div><a href="${d.link}" target="_blank" style="pointer-events: all; z-index: 10000;">Read more:</a> ${d.summary}</div>`;
      

      mtooltip
        .html(tooltipHTML)
        .style('position', 'absolute')
        .style('display', 'inline-block');

      handleMouseMove(d);
    }
  });

// Optional: Add this after your symbolLayer code to close tooltips when clicking elsewhere
d3.select('body').on('click', function() {
  // Check if click was on a circle or tooltip
  if (d3.event.target.tagName === 'circle' || d3.event.target.closest('.tooltip')) {
    return;
  }
  
  // Close sticky tooltip when clicking elsewhere
  if (stickyTooltip) {
    d3.select(stickyTooltip)
      .classed('highlight', false)
      .transition()
      .duration(100)
      .attr('stroke', '#333')
      .attr('stroke-width', .5);
    
    mtooltip.style('display', 'none');
    stickyTooltip = null;
  }
});
        
      } else if (state.selectedMapType === 'historical') {
        console.log('Setting up historical mode...');
        
        // Filter historical data
        let filtered = historicalData.filter(d => +d.year === +state.selectedDate);
        
        if (state.selectedDisease !== 'Total') {
          filtered = filtered.filter(d => d.disease === state.selectedDisease);
        }
        
        if (filtered.length > 0) {
          // FIXED: Use disease-specific max instead of year-specific max

          // Use single scale for all historical diseases
          const maxCases = historicalOverallMax;
          
          if (maxCases === 0) return; // don’t draw legend or bubbles

          // Create radius scale for historical data (yearly cases are typically larger)
          const historicalRadiusScale = d3.scaleSqrt()
            .domain([0, maxCases])
            .range([0, 75]); // Larger max radius and minimum radius for better visibility
          
          // Create lookup for country centroids (you'll need to add country center coordinates)
          const countryCentroids = {
            // North America
            'US': [-95.7129, 37.0902],
            'CA': [-106.3468, 56.1304],
            'MX': [-102.5528, 23.6345],
            'GT': [-90.2308, 15.7835],
            'BZ': [-88.4976, 17.1899],
            'SV': [-88.8965, 13.7942],
            'HN': [-86.2419, 15.2000],
            'NI': [-85.2072, 12.8654],
            'CR': [-83.7534, 9.7489],
            'PA': [-80.7821, 8.4381],
            'CU': [-77.7812, 21.5218],
            'JM': [-77.2975, 18.1096],
            'HT': [-72.2852, 18.9712],
            'DO': [-70.1627, 18.7357],
            'PR': [-66.5901, 18.2208],
            'TT': [-61.2225, 10.6918],
            'BB': [-59.5432, 13.1939],
            'GD': [-61.6790, 12.1165],
            'LC': [-60.9789, 13.9094],
            'VC': [-61.2872, 12.9843],
            'AG': [-61.7965, 17.0608],
            'KN': [-62.7830, 17.3578],
            'DM': [-61.3710, 15.4140],
            'BS': [-77.3963, 25.0343],
          
            // South America
            'BR': [-51.9253, -14.2350],
            'AR': [-63.6167, -38.4161],
            'CL': [-71.5430, -35.6751],
            'PE': [-75.0152, -9.1900],
            'CO': [-74.2973, 4.5709],
            'VE': [-66.5897, 6.4238],
            'EC': [-78.1834, -1.8312],
            'BO': [-63.5887, -16.2902],
            'PY': [-58.4438, -23.4425],
            'UY': [-55.7658, -32.5228],
            'GY': [-58.9302, 4.8604],
            'SR': [-56.0278, 3.9193],
            'GF': [-53.1258, 3.9339],
            'FK': [-59.5236, -51.7963],
          
            // Europe
            'GB': [-3.4360, 55.3781],
            'IE': [-8.2439, 53.4129],
            'FR': [2.2137, 46.2276],
            'ES': [-3.7038, 40.4168],
            'PT': [-8.2245, 39.3999],
            'IT': [12.5674, 41.8719],
            'DE': [10.4515, 51.1657],
            'AT': [14.5501, 47.5162],
            'CH': [8.2275, 46.8182],
            'NL': [5.2913, 52.1326],
            'BE': [4.4699, 50.5039],
            'LU': [6.1296, 49.8153],
            'DK': [9.5018, 56.2639],
            'SE': [18.6435, 60.1282],
            'NO': [8.4689, 60.4720],
            'FI': [25.7482, 61.9241],
            'IS': [-19.0208, 64.9631],
            'PL': [19.1343, 51.9194],
            'CZ': [15.4730, 49.8175],
            'SK': [19.6990, 48.6690],
            'HU': [19.5033, 47.1625],
            'SI': [14.9955, 46.1512],
            'HR': [15.2000, 45.1000],
            'BA': [17.6791, 43.9159],
            'RS': [21.0059, 44.0165],
            'ME': [19.3744, 42.7087],
            'MK': [21.7453, 41.6086],
            'AL': [20.1683, 41.1533],
            'GR': [21.8243, 39.0742],
            'BG': [25.4858, 42.7339],
            'RO': [24.9668, 45.9432],
            'MD': [28.3699, 47.4116],
            'UA': [31.1656, 48.3794],
            'BY': [27.9534, 53.7098],
            'LT': [23.8813, 55.1694],
            'LV': [24.6032, 56.8796],
            'EE': [25.0136, 58.5953],
            'RU': [105.3188, 61.5240],
            'MT': [14.3754, 35.9375],
            'CY': [33.4299, 35.1264],
            'TR': [35.2433, 38.9637],
            'GE': [43.3569, 42.3154],
            'AM': [45.0382, 40.0691],
            'AZ': [47.5769, 40.1431],
          
            // Asia
            'RU': [105.3188, 61.5240], // Russia spans Europe and Asia
            'CN': [104.1954, 35.8617],
            'IN': [78.9629, 20.5937],
            'ID': [113.9213, -0.7893],
            'PK': [69.3451, 30.3753],
            'BD': [90.3563, 23.6850],
            'JP': [138.2529, 36.2048],
            'PH': [121.7740, 12.8797],
            'VN': [108.2772, 14.0583],
            'TH': [100.9925, 15.8700],
            'MM': [95.9560, 21.9162],
            'MY': [101.9758, 4.2105],
            'SG': [103.8198, 1.3521],
            'KH': [104.9910, 12.5657],
            'LA': [102.4955, 19.8563],
            'NP': [84.1240, 28.3949],
            'BT': [90.4336, 27.5142],
            'LK': [80.7718, 7.8731],
            'MV': [73.2207, 3.2028],
            'KR': [127.7669, 35.9078],
            'KP': [127.5101, 40.3399],
            'MN': [103.8467, 46.8625],
            'KZ': [66.9237, 48.0196],
            'UZ': [64.5853, 41.3775],
            'TM': [59.5563, 38.9697],
            'KG': [74.7661, 41.2044],
            'TJ': [71.2761, 38.8610],
            'AF': [67.7090, 33.9391],
            'IR': [53.6880, 32.4279],
            'IQ': [43.6793, 33.2232],
            'SY': [38.9968, 34.8021],
            'LB': [35.8623, 33.8547],
            'JO': [36.2384, 30.5852],
            'IL': [34.8516, 32.0853],
            'PS': [35.2332, 31.9522],
            'SA': [45.0792, 23.8859],
            'YE': [48.5164, 15.5527],
            'OM': [55.9754, 21.4735],
            'AE': [53.8478, 23.4241],
            'QA': [51.1839, 25.3548],
            'BH': [50.6344, 25.9304],
            'KW': [47.4818, 29.3117],
          
            // Africa
            'DZ': [1.6596, 28.0339],
            'LY': [17.2283, 26.3351],
            'EG': [30.8025, 26.8206],
            'SD': [30.2176, 12.8628],
            'SS': [31.3070, 6.8770],
            'ET': [40.4897, 9.1450],
            'ER': [39.7823, 15.7394],
            'DJ': [42.5903, 11.8251],
            'SO': [46.1996, 5.1521],
            'KE': [37.9062, -0.0236],
            'UG': [32.2903, 1.3733],
            'TZ': [34.8888, -6.3690],
            'RW': [29.8739, -1.9403],
            'BI': [29.9189, -3.3731],
            'MW': [34.3015, -13.2543],
            'ZM': [27.8546, -13.1339],
            'ZW': [29.1549, -19.0154],
            'BW': [24.6849, -22.3285],
            'NA': [18.4241, -22.9576],
            'ZA': [22.9375, -30.5595],
            'LS': [28.2336, -29.6097],
            'SZ': [31.4659, -26.5225],
            'MZ': [35.5296, -18.6657],
            'MG': [46.8691, -18.7669],
            'MU': [57.5522, -20.3484],
            'SC': [55.4920, -4.6796],
            'KM': [43.8722, -11.6455],
            'AO': [17.8739, -11.2027],
            'CD': [21.7587, -4.0383],
            'CG': [15.8277, -0.2280],
            'CM': [12.3547, 7.3697],
            'CF': [20.9394, 6.6111],
            'TD': [18.7322, 15.4542],
            'NE': [8.0817, 17.6078],
            'NG': [8.6753, 9.0820],
            'BJ': [2.3158, 9.3077],
            'TG': [0.8248, 8.6195],
            'GH': [-1.0232, 7.9465],
            'CI': [-5.5471, 7.5400],
            'LR': [-9.4295, 6.4281],
            'SL': [-11.7799, 8.4606],
            'GN': [-9.6966, 9.9456],
            'GW': [-15.1804, 11.8037],
            'SN': [-14.4524, 14.4974],
            'GM': [-15.3101, 13.4432],
            'ML': [-3.9962, 17.5707],
            'BF': [-2.1829, 12.2383],
            'MR': [-10.9408, 21.0079],
            'MA': [-7.0926, 31.7917],
            'TN': [9.5375, 33.8869],
          
            // Oceania
            'AU': [133.7751, -25.2744],
            'NZ': [174.8860, -40.9006],
            'PG': [143.9555, -6.3150],
            'FJ': [179.4144, -16.5781],
            'SB': [160.1562, -9.6457],
            'NC': [165.6189, -20.9043],
            'VU': [166.9592, -15.3767],
            'WS': [-172.1046, -13.7590],
            'TO': [-175.1982, -21.1789],
            'TV': [177.6493, -7.1095],
            'KI': [-157.3630, 1.8709],
            'NR': [166.9315, -0.5228],
            'PW': [134.5825, 7.5150],
            'FM': [150.5508, 7.4256],
            'MH': [171.1845, 7.1315],
          
            // Additional territories and dependencies
            'GL': [-42.6043, 71.7069], // Greenland
            'AQ': [0.0000, -90.0000], // Antarctica (South Pole)
            'TW': [120.9605, 23.6978], // Taiwan
            'HK': [114.1694, 22.3193], // Hong Kong
            'MO': [113.5439, 22.1987], // Macau
            'RE': [55.5364, -21.1151], // Réunion
            'YT': [45.1662, -12.8275], // Mayotte
            'GP': [-61.5510, 16.9650], // Guadeloupe
            'MQ': [-61.0242, 14.6415], // Martinique
            'GI': [-5.3536, 36.1408], // Gibraltar
            'JE': [-2.1358, 49.2144], // Jersey
            'GG': [-2.5858, 49.4581], // Guernsey
            'IM': [-4.5481, 54.2361], // Isle of Man
            'FO': [-6.9118, 61.8926], // Faroe Islands
            'SJ': [19.1136, 78.9250], // Svalbard
            'AX': [19.9156, 60.1785], // Åland Islands
            'AS': [-170.1320, -14.2710], // American Samoa
            'GU': [144.7937, 13.4443], // Guam
            'MP': [145.3887, 17.3308], // Northern Mariana Islands
            'VI': [-64.8963, 18.3358], // U.S. Virgin Islands
            'BM': [-64.7505, 32.3078], // Bermuda
            'KY': [-80.5665, 19.2866], // Cayman Islands
            'TC': [-71.7979, 21.6940], // Turks and Caicos
            'MS': [-62.1874, 16.7425], // Montserrat
            'AI': [-63.0686, 18.2206], // Anguilla
            'BV': [3.4120, -54.4208], // Bouvet Island
            'CC': [96.8349, -12.1642], // Cocos Islands
            'CX': [105.6904, -10.4475], // Christmas Island
            'HM': [73.5044, -53.0818], // Heard Island
            'NF': [167.9492, -29.0408], // Norfolk Island
            'PN': [-127.9216, -24.7036], // Pitcairn Islands
            'SH': [-5.7089, -24.1434], // Saint Helena
            'PM': [-56.1735, 46.9419], // Saint Pierre and Miquelon
            'TF': [69.3516, -49.2804], // French Southern Territories
            'UM': [166.6000, 19.2911], // U.S. Minor Outlying Islands
            'WF': [-177.1560, -13.7687], // Wallis and Futuna
            'EH': [-12.8858, 24.2155], // Western Sahara
            'VA': [12.4534, 41.9029], // Vatican City
            'SM': [12.4578, 43.9424], // San Marino
            'MC': [7.4167, 43.7384], // Monaco
            'LI': [9.5215, 47.1662], // Liechtenstein
            'AD': [1.5218, 42.5063], // Andorra
          };
          // Add circles for historical data
          symbolLayer.selectAll('circle')
            .data(filtered.filter(d => countryCentroids[d.iso]))
            .enter()
            .append('circle')
            .attr('cx', d => {
              const coords = projection(countryCentroids[d.iso]);
              return coords[0];
            })
            .attr('cy', d => {
              const coords = projection(countryCentroids[d.iso]);
              return coords[1];
            })
            .attr('r', d => historicalRadiusScale(+d.cases))
            .attr('fill', d => diseaseColor(d.disease))
            .attr('fill-opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', .1)
            .on('mouseover', function(d) {
              const countryName = countryLookup[d.iso] || d.iso;
              const tooltipHTML = `<div class="font-lb" style="color:#4B535D;padding-bottom:5px">
                  ${countryName}</div><br><div>Disease: ${d.disease}<br><br>Cases: ${(+d.cases).toLocaleString()}<br><br>Year: ${d.year}</div>`;
      
            d3.select(this)
            .transition()
            .duration(100)
            .attr('stroke', '#000')                
            .attr('stroke-width', 1);

              mtooltip
                .html(tooltipHTML)
                .style('position', 'absolute')
                .style('display', 'inline-block');
              handleMouseMove(event, d);
            })

            .on('mouseout', function(event, d) {
              d3.select(this).classed('highlight', false)
                .transition()
                .duration(100)
                .attr('stroke', '#333')
                .attr('stroke-width', .1);
              
              mtooltip.style('display', 'none');
            })
            .on('mousemove', handleMouseMove);
        }
      }
      makeLegend();
    }
 
function findRectangularQuadrant (x, y, width, height) {
  var vertical = '';
  var horizontal = '';
  if (y < height / 2) {
    vertical = 't';
  } else {
    vertical = 'b';
  }
  if (x < width / 2) {
    horizontal = 'l';
  } else {
    horizontal = 'r';
  }
  return vertical + horizontal;
}

function handleMouseMove (d) {
  let rect = document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect();
  let cursorX = event.clientX - rect.left;
  let cursorY = event.clientY - rect.top;

  let tw = parseInt(mtooltip.style('width'))
  let th = parseInt(mtooltip.style('height'))
  let offset = 25

  // change tooltip dimensions in styles.scss

  let px = event.pageX
  let py = event.pageY

  let pos = findRectangularQuadrant(cursorX, cursorY, rect.width, rect.height)
  switch (pos) {
    // if tl -> br
    case 'tl':
      mtooltip
        .style('left', px + offset - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().left + 'px')
        //.style('top', (py + offset) - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().top + 'px')
        .style('top', cursorY + 'px')
        // .style('display', 'inline-block')
      break;
    // tr -> bl
    case 'tr':
      mtooltip
        .style('left', px - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().left - (tw + offset) + 'px')
        //.style('top', (py + offset) - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().top + 'px')
        .style('top', cursorY + 'px')
        // .style('display', 'inline-block')
      break;
    // bl -> tr
    case 'bl':
      mtooltip
        .style('left', px + offset - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().left + 'px')
        //.style('top', py - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().top - th + 'px')
        .style('top', cursorY + 'px')
        // .style('display', 'inline-block')
      break;
    // br -> tl
    case 'br':
      mtooltip
        .style('left', px - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().left - (tw + offset) + 'px')
        //.style('top', py - document.querySelector(`#${project} svg.svg-content`).getBoundingClientRect().top - th + 'px')
        .style('top', cursorY + 'px')
        // .style('display', 'inline-block')
      break;
  }
}

//slider

function formatMonthLabel(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}

const realtimeSliderValues = [...new Set(
  realtimeData.map(d => getMonthFormatted(d.date))
)].sort((a, b) => {
  // Convert back to dates for proper chronological sorting
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA - dateB;
});

function getMonthFormatted(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return null; // defensive check for bad input
  
  // Return formatted month name and year
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }); // defensive check for bad input

/*const realtimeSliderValues = [...new Set(
  realtimeData.map(d => getWeekEndingDateFormatted(d.date))
)].sort((a, b) => new Date(a) - new Date(b));

function getWeekEndingDateFormatted(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return null; // defensive check for bad input

  const day = date.getDay(); // 0–6 (Sun–Sat)
  const diff = 6 - day; // how many days to next Saturday
  date.setDate(date.getDate() + diff);

  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`; // e.g. "5-20-2025"*/
}

function makeSlider() {
  console.log('makeSlider called - Mode:', state.selectedMapType);
  
  const sliderData = state.selectedMapType === 'realtime'
    ? realtimeSliderValues
    : historicalSliderValues;

  console.log('Slider data:', sliderData);
  console.log('Slider data length:', sliderData.length);

  const $slider = jQuery(`#${project} #dslider`);

  // Destroy existing slider completely
  if ($slider.hasClass('ui-slider')) {
    $slider.slider('destroy');
  }
  
  // Clear any existing content
  $slider.empty();
  
  // Re-add the handle HTML
  $slider.html('<div id="custom-handle" class="ui-slider-handle"><p id="slider-text"></p></div>');

  // Determine the initial value
  let initialValue;
  let initialLabel;
  
  if (state.selectedMapType === 'historical') {
    // For historical, try to find 2023, otherwise use the last year
    initialValue = sliderData.length - 1;
    initialLabel = sliderData[initialValue];
  } else {
    // For realtime, use the most recent date
    initialValue = sliderData.length - 1;
    initialLabel = sliderData[initialValue];
  }

  console.log('Initial slider value:', initialValue, 'Label:', initialLabel);

  // Create the slider
  $slider.slider({
    min: 0,
    max: sliderData.length - 1,
    value: initialValue,
    
    create: function() {
      console.log('Slider created with value:', initialValue);
      jQuery(`#${project} #custom-handle #slider-text`).text(initialLabel);
      state.selectedDate = initialLabel;
      
      // Force update the map after slider creation
      setTimeout(() => {
        updateMap();
      }, 100);
    },

    slide: function(event, ui) {
      const label = sliderData[ui.value];
      console.log('Slider slide - Value:', ui.value, 'Label:', label);
      jQuery(`#${project} #custom-handle #slider-text`).text(label);
      state.selectedDate = label;
      updateMap();
    },

    stop: function(event, ui) {
      const label = sliderData[ui.value];
      console.log('Slider stop - Value:', ui.value, 'Label:', label);
      jQuery(`#${project} #custom-handle #slider-text`).text(label);
      state.selectedDate = label;
      updateMap();
    }
  });
  
  // Ensure the handle is visible and positioned correctly
  const handle = jQuery(`#${project} #custom-handle`);
  handle.show();
  
  console.log('Slider setup complete');
}

//legend
/*
function makeLegend() {
  const padding = 15;
  const legendPadding = 20;

  svgLegend.select('#legend').remove();
  
  const legend = svgLegend.append('g').attr('id', 'legend');
  legend.attr('transform', `translate(${legendPadding}, ${height - 180 - legendPadding})`);   

  if (state.selectedMapType === 'realtime') {
    // COLOR LEGEND - Datawrapper style
    let colorLegendY = 0;
    
    legend
      .append('text')
      .attr('x', 25)
      .attr('y', colorLegendY - 75)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Disease');

    const diseases = ['Chicken Pox', 'Diptheria', 'Hepatitis A', 'Hepatitis B', 'Measles', 'Mumps', 'Polio', 'RSV', 'Whooping Cough'];
    const diseaseLabels = {
      'Chicken Pox': 'Chicken Pox',
      'Diptheria': 'Diptheria',
      'Hepatitis A': 'Hepatitis A',
      'Hepatitis B': 'Hepatitis B',
      'Measles': 'Measles',
      'Mumps': 'Mumps',
      'Polio': 'Polio',
      'RSV': 'RSV',
      'Whooping Cough': 'Whooping Cough'

    };

    diseases.forEach((disease, i) => {
      const yPos = colorLegendY - 60 + (i * 18);
      
      // Color circle
      legend.append('circle')
        .attr('cx', 30)
        .attr('cy', yPos)
        .attr('r', 6)
        .attr('fill', diseaseColor(disease.toLowerCase()))
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);
      
      // Label
      legend.append('text')
        .attr('x', 42)
        .attr('y', yPos + 4)
        .style('font-size', '11px')
        .text(diseaseLabels[disease]);
    });

    // SIZE LEGEND - Better scaling
    const sizeLegendY = colorLegendY + 120;
    
    legend
      .append('text')
      .attr('x', 25)
      .attr('y', sizeLegendY)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Outbreak Size');

    // Use more visible sizes
    const valuesToShow = [100];
    const scaleFactor = 3; // Make bubbles 50% larger in legend for visibility
    
    valuesToShow.forEach((val, i) => {
      const r = radiusScale(val) * scaleFactor;
      const cy = sizeLegendY + 50 - r; // Stack from bottom
      const cx = 37;

      legend.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', '#999')
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);

      legend.append('line')
        .attr('x1', cx + r)
        .attr('x2', cx + 35)
        .attr('y1', cy)
        .attr('y2', cy)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2');

      legend.append('text')
        .attr('x', cx + 40)
        .attr('y', cy + 4)
        .style('font-size', '11px')
        .text(val === 10 ? '10 cases' : val + ' cases');
    });

  } 
  else if (state.selectedMapType === 'historical') {
    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 0)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Disease Type');

    const historicalDiseases = ['Measles', 'Mumps', 'Polio', 'Whooping Cough'];
    
    historicalDiseases.forEach((disease, i) => {
      const yPos = 20 + (i * 18);
      
      legend.append('circle')
        .attr('cx', 30)
        .attr('cy', yPos)
        .attr('r', 6)
        .attr('fill', diseaseColor(disease.toLowerCase()))
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);
      
      legend.append('text')
        .attr('x', 42)
        .attr('y', yPos + 4)
        .style('font-size', '11px')
        .text(disease);
    });

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 100)
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text('Annual Cases');

    let filtered = historicalData.filter(d => +d.year === +state.selectedDate);
    if (state.selectedDisease !== 'Total') {
      filtered = filtered.filter(d => d.disease === state.selectedDisease);
    }

    if (filtered.length > 0) {
      const maxCases = d3.max(filtered, d => +d.cases);
      const minCases = d3.min(filtered, d => +d.cases);
      
      // Show three representative bubble sizes
      const valuesToShow = [
        maxCases,
        maxCases / 2,
        maxCases / 10
      ];
      
      valuesToShow.forEach((val, i) => {
        const r = historicalRadiusScale(val);
        const cy = 160;
        const cx = 45;

        legend.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', r)
          .attr('fill', '#999')
          .attr('fill-opacity', 0.3)
          .attr('stroke', '#333')
          .attr('stroke-width', 0.5);

        legend.append('line')
          .attr('x1', cx + r)
          .attr('x2', cx + 35)
          .attr('y1', cy)
          .attr('y2', cy)
          .attr('stroke', '#333')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '2,2');

        legend.append('text')
          .attr('x', cx + 40)
          .attr('y', cy + 4)
          .style('font-size', '11px')
          .text(val.toLocaleString());
      });
    }
  }
}*/
/*
function makeLegend() {
  const padding = 15;
  const legendPadding = 20;

  // Clear any existing legend
  svgLegend.select('#legend').remove();

  const legend = svgLegend.append('g').attr('id', 'legend');
  legend.attr('transform', `translate(${legendPadding}, ${height - 180 - legendPadding})`);

  // --- REALTIME LEGEND ---
  if (state.selectedMapType === 'realtime') {
      // COLOR LEGEND
      let colorLegendY = 0;

      legend.append('text')
          .attr('x', 25)
          .attr('y', colorLegendY - 75)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const diseases = ['Chicken Pox', 'Diphtheria', 'Hepatitis A', 'Hepatitis B', 'Measles', 'Mumps', 'Polio', 'RSV', 'Whooping Cough'];
      const diseaseLabels = {
          'Chicken Pox': 'Chicken Pox',
          'Diphtheria': 'Diphtheria',
          'Hepatitis A': 'Hepatitis A',
          'Hepatitis B': 'Hepatitis B',
          'Measles': 'Measles',
          'Mumps': 'Mumps',
          'Polio': 'Polio',
          'RSV': 'RSV',
          'Whooping Cough': 'Whooping Cough'
      };

      diseases.forEach((disease, i) => {
          const yPos = colorLegendY - 60 + (i * 18);

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease.toLowerCase()))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(diseaseLabels[disease]);
      });

      // SIZE LEGEND
      const sizeLegendY = colorLegendY + 120;

      legend.append('text')
          .attr('x', 25)
          .attr('y', sizeLegendY)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Outbreak Size');

      const valuesToShow = [10, 100, 1000];
      const scaleFactor = 1.2;

      let lastY = sizeLegendY + 10;
      valuesToShow.forEach((val, i) => {
          const r = radiusScale(val) * scaleFactor;
          const cy = lastY + r;
          const cx = 37;

          legend.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', r)
              .attr('fill', '#999')
              .attr('fill-opacity', 0.3)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('line')
              .attr('x1', cx + r)
              .attr('x2', cx + 35)
              .attr('y1', cy)
              .attr('y2', cy)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5)
              .attr('stroke-dasharray', '2,2');

          legend.append('text')
              .attr('x', cx + 40)
              .attr('y', cy + 4)
              .style('font-size', '11px')
              .text(`${val.toLocaleString()} cases`);

          lastY = cy + r + 5;
      });

  // --- HISTORICAL LEGEND ---
  } else if (state.selectedMapType === 'historical') {
      // COLOR LEGEND
      legend.append('text')
          .attr('x', 25)
          .attr('y', -8)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const historicalDiseases = ['Measles', 'Mumps', 'Polio', 'Whooping Cough', 'Diphtheria'];

      historicalDiseases.forEach((disease, i) => {
          const yPos = 5 + (i * 18);

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease.toLowerCase()))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(disease);
      });

      // SIZE LEGEND
      legend.append('text')
          .attr('x', 25)
          .attr('y', 110)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Annual Cases');

      let filtered = historicalData.filter(d => +d.year === +state.selectedDate);
      if (state.selectedDisease !== 'Total') {
          filtered = filtered.filter(d => d.disease === state.selectedDisease);
      }

      if (filtered.length > 0) {
          const maxCases = d3.max(filtered, d => +d.cases);
          // Define the scale for historical data locally
          const historicalRadiusScale = d3.scaleSqrt()
              .domain([0, maxCases])
              .range([0, 25]);

          const valuesToShow = [1000, 10000, 100000];
          
          let lastY = 120;
          valuesToShow.forEach((val, i) => {
              const r = historicalRadiusScale(val);
              const cy = lastY + r;
              const cx = 45;

              legend.append('circle')
                  .attr('cx', cx)
                  .attr('cy', cy)
                  .attr('r', r)
                  .attr('fill', '#999')
                  .attr('fill-opacity', 0.3)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5);

              legend.append('line')
                  .attr('x1', cx + r)
                  .attr('x2', cx + 35)
                  .attr('y1', cy)
                  .attr('y2', cy)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5)
                  .attr('stroke-dasharray', '2,2');

              legend.append('text')
                  .attr('x', cx + 40)
                  .attr('y', cy + 4)
                  .style('font-size', '11px')
                  .text(val.toLocaleString());

              lastY = cy + r + 5;
          });
      }
  }
}*/
/*
function makeLegend() {
  const padding = 15;
  const legendPadding = 20;

  // Clear any existing legend
  svgLegend.select('#legend').remove();

  const legend = svgLegend.append('g').attr('id', 'legend');
  legend.attr('transform', `translate(${legendPadding}, ${height - 180 - legendPadding})`);

  const legendRadiusScale = d3.scaleSqrt()
  .domain([0, d3.max(realtimeData, d => +d.cases)])
  .range([7, 70]);

  // --- REALTIME LEGEND ---
  if (state.selectedMapType === 'realtime') {
      // COLOR LEGEND
      let colorLegendY = 0;

      legend.append('text')
          .attr('x', 25)
          .attr('y', colorLegendY - 75)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const diseases = ['Chicken Pox', 'Diphtheria', 'Hepatitis A', 'Hepatitis B', 'Measles', 'Mumps', 'Polio', 'RSV', 'Whooping Cough'];
      const diseaseLabels = {
          'Chicken Pox': 'Chicken Pox',
          'Diphtheria': 'Diphtheria',
          'Hepatitis A': 'Hepatitis A',
          'Hepatitis B': 'Hepatitis B',
          'Measles': 'Measles',
          'Mumps': 'Mumps',
          'Polio': 'Polio',
          'RSV': 'RSV',
          'Whooping Cough': 'Whooping Cough'
      };

      diseases.forEach((disease, i) => {
          const yPos = colorLegendY - 60 + (i * 18);

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease.toLowerCase()))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(diseaseLabels[disease]);
      });

      // SIZE LEGEND
      const sizeLegendY = colorLegendY + 120;

      legend.append('text')
          .attr('x', 25)
          .attr('y', sizeLegendY)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Outbreak Size');

      const valuesToShow = [10, 10000];

      let lastY = sizeLegendY + 10;
      valuesToShow.forEach((val, i) => {
          const r = legendRadiusScale(val); // Use the matching scale, no scaleFactor
          const cy = lastY + r;
          const cx = 37;

          legend.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', r)
              .attr('fill', '#999')
              .attr('fill-opacity', 0.3)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('line')
              .attr('x1', cx + r)
              .attr('x2', cx + 35)
              .attr('y1', cy)
              .attr('y2', cy)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5)
              .attr('stroke-dasharray', '2,2');

          legend.append('text')
              .attr('x', cx + 40)
              .attr('y', cy + 4)
              .style('font-size', '11px')
              .text(`${val.toLocaleString()} cases`);

          lastY = cy + r + 5;
      });

  // --- HISTORICAL LEGEND ---
  } else if (state.selectedMapType === 'historical') {
      // COLOR LEGEND
      legend.append('text')
          .attr('x', 25)
          .attr('y', -8)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const historicalDiseases = ['Measles', 'Mumps', 'Polio', 'Whooping Cough', 'Diphtheria'];

      historicalDiseases.forEach((disease, i) => {
          const yPos = 5 + (i * 18);

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease.toLowerCase()))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(disease);
      });

      // SIZE LEGEND - FIXED to use disease-specific max
      legend.append('text')
          .attr('x', 25)
          .attr('y', 110)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Annual Cases');

      // FIXED: Use disease-specific max for legend consistency
      // Use single scale for all historical diseases  
const maxCases = historicalOverallMax;

      if (maxCases > 0) {
          // Define the scale for historical data locally using disease-specific max
          const historicalRadiusScale = d3.scaleSqrt()
              .domain([0, maxCases])
              .range([0, 50]);

          const valuesToShow = [1000, 100000];
          
          let lastY = 120;
          valuesToShow.forEach((val, i) => {
              const r = historicalRadiusScale(val);
              const cy = lastY + r;
              const cx = 45;

              legend.append('circle')
                  .attr('cx', cx)
                  .attr('cy', cy)
                  .attr('r', r)
                  .attr('fill', '#999')
                  .attr('fill-opacity', 0.3)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5);

              legend.append('line')
                  .attr('x1', cx + r)
                  .attr('x2', cx + 35)
                  .attr('y1', cy)
                  .attr('y2', cy)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5)
                  .attr('stroke-dasharray', '2,2');

              legend.append('text')
                  .attr('x', cx + 40)
                  .attr('y', cy + 4)
                  .style('font-size', '11px')
                  .text(val.toLocaleString());

              lastY = cy + r + 5;
          });
      }
  }
}*/

function makeLegend() {
  const padding = 15;
  const legendPadding = 20;

  // Clear any existing legend
  svgLegend.select('#legend').remove();

  const legend = svgLegend.append('g').attr('id', 'legend');
  // CHANGED: Move the entire legend up by increasing the offset
  legend.attr('transform', `translate(${legendPadding}, ${height - 180 - legendPadding})`); // Changed from 280 to 255 (moves down 25px)

  const legendRadiusScale = d3.scaleSqrt()
  .domain([0, d3.max(realtimeData, d => +d.cases)])
  .range([7, 70]);

  // --- REALTIME LEGEND ---
  if (state.selectedMapType === 'realtime') {
      // COLOR LEGEND - moved up
      let colorLegendY = -50; // CHANGED: Start higher up (was 0)

      legend.append('text')
          .attr('x', 25)
          .attr('y', colorLegendY - 75) // This will now be -125
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const diseases = ['Chicken Pox', 'Diphtheria', 'Hepatitis A', 'Hepatitis B', 'Measles', 'Mumps', 'Polio', 'Respiratory Syncytial Virus', 'Whooping Cough'];
      const diseaseLabels = {
          'Chicken Pox': 'Chicken Pox',
          'Diphtheria': 'Diphtheria',
          'Hepatitis A': 'Hepatitis A',
          'Hepatitis B': 'Hepatitis B',
          'Measles': 'Measles',
          'Mumps': 'Mumps',
          'Polio': 'Polio',
          'Respiratory Syncytial Virus': 'RSV',
          'Whooping Cough': 'Whooping Cough'
      };

      diseases.forEach((disease, i) => {
          const yPos = colorLegendY - 60 + (i * 18);

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(diseaseLabels[disease]);
      });

      // SIZE LEGEND - keeps same spacing relative to color legend
      const sizeLegendY = colorLegendY + 120; // Same relative positioning

      legend.append('text')
          .attr('x', 25)
          .attr('y', sizeLegendY)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Outbreak Size');

      const valuesToShow = [10, 1000, 10000];

      let lastY = sizeLegendY + 10;
      valuesToShow.forEach((val, i) => {
          const r = legendRadiusScale(val);
          const cy = lastY + r;
          const cx = 37;

          legend.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', r)
              .attr('fill', '#999')
              .attr('fill-opacity', 0.3)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('line')
              .attr('x1', cx + r)
              .attr('x2', cx + 35)
              .attr('y1', cy)
              .attr('y2', cy)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5)
              .attr('stroke-dasharray', '2,2');

          legend.append('text')
              .attr('x', cx + 40)
              .attr('y', cy + 4)
              .style('font-size', '11px')
              .text(`${val.toLocaleString()} cases`);

          lastY = cy + r + 5;
      });

  // --- HISTORICAL LEGEND ---
  } else if (state.selectedMapType === 'historical') {
      // COLOR LEGEND - also moved up
      legend.attr('transform', `translate(${legendPadding}, ${height - 200 - legendPadding})`); 
      
      legend.append('text')
          .attr('x', 25)
          .attr('y', -58) // CHANGED: moved up (was -8)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Disease');

      const historicalDiseases = ['Measles', 'Mumps', 'Polio', 'Whooping Cough', 'Diphtheria'];

      historicalDiseases.forEach((disease, i) => {
          const yPos = -45 + (i * 18); // CHANGED: moved up (was 5)

          legend.append('circle')
              .attr('cx', 30)
              .attr('cy', yPos)
              .attr('r', 6)
              .attr('fill', diseaseColor(disease))
              .attr('fill-opacity', 0.7)
              .attr('stroke', '#333')
              .attr('stroke-width', 0.5);

          legend.append('text')
              .attr('x', 42)
              .attr('y', yPos + 4)
              .style('font-size', '11px')
              .text(disease);
      });

      // SIZE LEGEND - moved up
      legend.append('text')
          .attr('x', 25)
          .attr('y', 60) // CHANGED: moved up (was 110)
          .style('font-weight', 'bold')
          .style('font-size', '12px')
          .text('Annual Cases');

      const maxCases = historicalOverallMax;

      if (maxCases > 0) {
          const historicalRadiusScale = d3.scaleSqrt()
              .domain([0, maxCases])
              .range([7, 75]);

          const valuesToShow = [1000, 10000, 100000];
          
          let lastY = 70; // CHANGED: moved up (was 120)
          valuesToShow.forEach((val, i) => {
              const r = historicalRadiusScale(val);
              const cy = lastY + r;
              const cx = 45;

              legend.append('circle')
                  .attr('cx', cx)
                  .attr('cy', cy)
                  .attr('r', r)
                  .attr('fill', '#999')
                  .attr('fill-opacity', 0.3)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5);

              legend.append('line')
                  .attr('x1', cx + r)
                  .attr('x2', cx + 35)
                  .attr('y1', cy)
                  .attr('y2', cy)
                  .attr('stroke', '#333')
                  .attr('stroke-width', 0.5)
                  .attr('stroke-dasharray', '2,2');

              legend.append('text')
                  .attr('x', cx + 40)
                  .attr('y', cy + 4)
                  .style('font-size', '11px')
                  .text(val.toLocaleString());

              lastY = cy + r + 5;
          });
      }
  }
}

choices1.passedElement.element.addEventListener('change', function(event) {
  let selectedDisease = choices1.getValue().value;
  state.selectedDisease = selectedDisease; 
  
  updateMap(); 
}, false);

choices2.passedElement.element.addEventListener('change', function(event) {
  let selectedType = choices2.getValue().value;
  console.log('Type dropdown changed to:', selectedType);
  state.selectedMapType = selectedType;
  
  if (selectedType === 'historical') {
    state.selectedDisease = 'Measles';
    state.selectedDate = '2024'; 
    let historicalOptions = ['Measles', 'Mumps', 'Polio', 'Whooping Cough', 'Diphtheria']
      .map(x => ({value: x, label: nameLookup[x]}));
    choices1.clearStore();
    choices1.setChoices(historicalOptions);
    choices1.setChoiceByValue('Measles');
} else {
    // Reset to full list for realtime
    state.selectedDisease = 'Total'; 
    choices1.clearStore();
    choices1.setChoices(options1);
    choices1.setChoiceByValue('Total');
}
  
  // Make sure to call makeSlider before updateMap
  setTimeout(() => {
    makeSlider();
    updateMap();
  }, 50);
  
}, false);

jQuery(window).on('resize', function (e) {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    redraw()
  }, 10);
  var windowWidth = jQuery(window).width()
  svgLegend.attr('width',windowWidth)
  if (windowWidth <= 680) {
    document.querySelector(`#${project} .v-legend-medium-container`).classList.remove('flex')
    document.querySelector(`#${project} .v-legend-medium-container`).classList.add('grid')
    document.querySelectorAll(`#${project} .toggleTool`).forEach(function(d,i){
      d.style['max-width'] = 'unset'
      d.style['width'] = '100%'
      d.style['padding-bottom'] = '8px'
      d.style['padding-right'] = '8px'

      if (i == 2){
        d.style['padding-right'] = '36px'
      }
     
    })
    jQuery(`#${project} g#legend`).hide()
    jQuery(`#${project} g#mlegend`).show()
    svgLegend.style('bottom','-100px')
    //document.querySelector('.downloadLink').style.bottom = '-115px'
  } else {
    document.querySelector(`#${project} .v-legend-medium-container`).classList.add('flex')
    document.querySelector(`#${project} .v-legend-medium-container`).classList.remove('grid')
    document.querySelectorAll(`#${project} .toggleTool`).forEach(function(d,i){
      d.style['width'] = '200px'
      d.style['padding-right'] = '8px'
      d.style['padding-bottom'] = '0px'
      
      if (i == 1 || i == 2){
        d.style['width'] = '296px'
      }
      
    })
    svgLegend.style('bottom','0px')
    jQuery(`#${project} g#legend`).show()
    jQuery(`#${project} g#mlegend`).hide()
    //document.querySelector('.downloadLink').style.bottom = '-15px'
  }
})

jQuery(document).ready(function () {
  makeSlider()
  updateMap()
  makeLegend()
  window.dispatchEvent(new Event('resize'));
  //console.log(getAllMax('Total','consumption'))
})