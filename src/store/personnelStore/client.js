import * as Client from '@/APIs/PERSONNEL/ClientAPI.js'

export default{

    namespaced: true,

    state(){
        return {
            clientsPending: [],

            searchResult: null,

            clientsAdded: [],

            listCurrentClientTransactions: [],

            objectValuesEmpty: false,

        }
    },
    mutations:{

        searchClient(state,id){
            const index = state.clientsPending.findIndex(item => item.userId=== id)
            if(index>=0){
                console.log(state.clientsPending[index])
                state.searchResult = state.clientsPending[index]
            }else{
                state.searchResult = null
                console.log('nothing found!')
            }
        },

        //CRUD CLIENTADDED
        addClient(state,payload){
            console.log('added')
            state.clientsAdded.push(payload)
        },

        updateClient(state,payload){
            const index = state.clientsAdded.findIndex(item => item.userId=== payload.id)
            console.log(index)
            console.log(state.clientsAdded[0].profile)
            if(index>=0){
               state.clientsAdded[index].profile = payload
            }    
        },

        deleteClient(state,id){
            const index = state.clientsAdded.findIndex(item => item.id === id)
            state.clientsAdded.splice(index,1)
        },

        setLocalListPending(state,response){
            response.data.forEach(item => {
                state.clientsPending.push(item)
                console.log(item)
            })
        },

        //start check object null value or not
        areObjectValuesNull(state,obj){
            delete obj['_id']
            let ctr = 0;
            for(const keys in obj){
                if(obj[keys] !== null){
                    ctr+=1;
                }
            }
            if(ctr>0){
                state.objectValuesEmpty = false
            }else{
                state.objectValuesEmpty = true
            }
        },
        //start check object null value or not

        //start of letter intent downloadable

        //start of letter intent downloadable



        setLocalLegitList(state,response){
            response.data.forEach(async (item) => {

                //start CREATE donwloadable letterofIntent
                this.commit('client/areObjectValuesNull',item.letterOfIntent) 
                const LetterOfIntentFilename = `${item.userId}_${item.fullname}_letter_of_intent.pdf`  
                var LetterOfIntentURL = '' 

                const hasLetterOfIntent = state.objectValuesEmpty
                if(!hasLetterOfIntent){
                    try{
                        const downloadableLetterOfIntent = await Client.retrieveUploadedForm(item.userId,LetterOfIntentFilename)
                        const LetterOfIntentBlob = new Blob([downloadableLetterOfIntent], {type: 'application/pdf'})
                        LetterOfIntentURL = URL.createObjectURL(LetterOfIntentBlob)                        
                    }catch(error){
                        console.log(error)
                    }
                }
                item.LetterOfIntentURL = LetterOfIntentURL
                item.LetterOfIntentFilename = LetterOfIntentFilename
                //start CREATE donwloadable letterofIntent

                

                state.clientsAdded.push(item)
            })
        },

        /*start payment transactions */
        pushCurrentClientTransactions(state,payload){
            state.listCurrentClientTransactions = []
            if(payload.list.length>0){
                payload.list.forEach(async (item) => {
                    
                    try{
                        const file = await Client.retrieveUploadedFile(payload.id,item.attachments[0].filename)
                        const blob = new Blob([file],{type: 'application/pdf'})
                        const url = URL.createObjectURL(blob)
                        const download = item.attachments[0].filename
                        item.url = url;
                        item.download = download;
                        state.listCurrentClientTransactions.push(item)                         
                    }catch(error){
                        console.log(error)
                    }
   
                })
            }
        }
        /*end payment transactions */
        
    },
    actions:{

        async getPendingList(context){
            try{
                const response = await Client.requestPendingList()
                context.commit('setLocalListPending',response)
            }catch(error){
                console.log(error)
            }   
        },

        async getLegitList(context){
            try{
                const response = await Client.requestLegitList()
                context.commit('setLocalLegitList',response)
            }catch(error){
                console.log(error)
            }
        },

        //do the http request functions here
        async addClient(context,id){   
            try{
                const payload = await Client.addToLegitClient(id)
                context.commit('addClient',payload.data)
                console.log(payload)
            }catch(error){
                console.log(error)
            }
        },
        updateClient(context,payload){
            context.commit('updateClient',payload)
            //http request for updating the specific legit client
        },
        deleteClient(context,id){
            context.commit('deleteClient',id)
            //http request for deleting specific legit client
        },

        //start payment transactions
        async getListTransaction(context,id){
            console.log(id)
            try{
                const response = await Client.getListTransaction(id)
                // console.log(response)
                context.commit('pushCurrentClientTransactions',{
                    id: id,
                    list:response.data})
                return response
            }catch(error){
                console.log(error)
                throw error
            }
        },
        async addPayment(_,payload){
            try{
                const response = await Client.addPaymentTransaction({
                    id:payload.id,
                    obj:payload.obj})
                console.log(response)
                return response.message
            }catch(error){
                console.log(error)
                throw error
            }
        },
        //end payment transactions

        //start downloadable Form
        async retrieveUploadedForm(_,payload){
            try{
                const response = await Client.retrieveUploadedForm({
                    id: payload.id,
                    filename: payload.filename
                })
                return response
            }catch(error){
                console.log(error)
                throw error
            }
        }
        //end downloadable Form

    },
    getters:{
        searchResultGetter(state){
            if(state.searchResult){
               return state.searchResult 
            }else{
                return null
            }
        },
        clientsGetter(state){
            return state.clientsAdded
        },

        /*start transaction payment */
        clientTransactionGetter(state){ 
            console.log(state.listCurrentClientTransactions )
            return state.listCurrentClientTransactions 
        },
        /*end transaction payment */
    }
}