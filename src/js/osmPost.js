
import xmljs from 'xml-js'
import initOSM from './initOSM'
import uploadPost from './uploadPost'
let initOSMasXML=xmljs.json2xml(initOSM)
let initialRequest=function(){
return axios.put('https://www.openstreetmap.org/api/0.6/changeset/create',initOSMasXML,
      {headers: {'content-type': 'text/xml'}})
}

let intermediateRequest=function(){
    initialRequest.then(function(response){
        return axios.post('https://www.openstreetmap.org/api/0.6/changeset/'+response.data+'/upload',uploadPost,
        {headers: {'content-type': 'text/xml'}})
  
    })
}

export default intermediateRequest