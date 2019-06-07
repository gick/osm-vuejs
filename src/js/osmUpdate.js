
import xmljs from 'xml-js'
var osmAuth = require("osm-auth");
var auth = osmAuth({
    oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
    oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0'
});
import OSMTreeTemplate from './treeTemplate'
import initOSM from './initOSM'
import {EventBus} from './osmBus'
let initOSMasXML = xmljs.json2xml(initOSM)
let setAttributes = function (releve, update) {
    let kv = {
        attributes: {
            k: "key",
            v: "value"
        },
        name: "tag",
        type: "element"
    }


    if (releve.specie) {
        let specieKV = _.cloneDeep(kv)
        specieKV.attributes.k = "species"
        specieKV.attributes.v = releve.specie
        update.elements[0].elements[0].elements.push(specieKV)
    }

    if (releve.genus) {
        let genusKV = _.cloneDeep(kv)
        genusKV.attributes.k = "genus"
        genusKV.attributes.v = releve.genus
        update.elements[0].elements[0].elements.push(genusKV)
    }

    if (releve.common) {
        let commonKV = _.cloneDeep(kv)
        commonKV.attributes.k = "name:fr"
        commonKV.attributes.v = releve.common
        update.elements[0].elements[0].elements.push(commonKV)
    }


}

let osmUpdate = function (releve) {
    let treeTemplate=_.cloneDeep(OSMTreeTemplate)
    auth.xhr({
        method: 'PUT', path: '/api/0.6/changeset/create', dataType: "text/xml",
        options: { header: { "Content-Type": "text/xml" } },
        content: initOSMasXML
    },
        function (err, details) {
            treeTemplate.elements[0].elements[0].attributes.changeset = details
            treeTemplate.elements[0].elements[0].attributes.lon = releve.location.coordinates[0]
            treeTemplate.elements[0].elements[0].attributes.lat = releve.location.coordinates[1]
            treeTemplate.elements[0].elements[0].attributes.id = releve.nodeId
            treeTemplate.elements[0].elements[0].attributes.version = releve.version
            setAttributes(releve,treeTemplate)
            let template = xmljs.json2xml(treeTemplate)

            auth.xhr({
                method: 'PUT', path: '/api/0.6/node/' + releve.nodeId, dataType: "text/xml",
                options: { header: { "Content-Type": "text/xml" } },
                content: template
            },
                function (err, details) {
                    EventBus.$emit('updateOSM')
                })
        })
}

export default osmUpdate