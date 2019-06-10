
import xmljs from 'xml-js'
var osmAuth = require("osm-auth");
var auth = osmAuth({
    oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
    oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0'
});
import removeTreeTemplate from './treeTemplate'
import initOSM from './initOSM'
import {EventBus} from './osmBus'

let initOSMasXML = xmljs.json2xml(initOSM)

let removeTree = function (osmTree) {
    auth.xhr({
        method: 'PUT', path: '/api/0.6/changeset/create', dataType: "text/xml",
        options: { header: { "Content-Type": "text/xml" } },
        content: initOSMasXML
    },
        function (err, details) {
            removeTreeTemplate.elements[0].elements[0].attributes.changeset = details
            removeTreeTemplate.elements[0].elements[0].attributes.lon = osmTree.coordinates[0]
            removeTreeTemplate.elements[0].elements[0].attributes.lat = osmTree.coordinates[1]
            removeTreeTemplate.elements[0].elements[0].attributes.id = osmTree.nodeId
            removeTreeTemplate.elements[0].elements[0].attributes.version = osmTree.version
            let removeTreeXML = xmljs.json2xml(removeTreeTemplate)

          auth.xhr({
                method: 'DELETE', path: '/api/0.6/node/' + osmTree.nodeId, dataType: "text/xml",
                options: { header: { "Content-Type": "text/xml" } },
                content: removeTreeXML
            },
                function (err, details) {
                    EventBus.$emit('updateOSM')
                })
        })
}

export default removeTree