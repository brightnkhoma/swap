import { collection, doc, DocumentData, DocumentReference, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { firestoredb } from "../firebasse/firebase";

type Card = {
    cardNumber : string;
    cardHolder : User;
    cardId : CardId

}


export type Transaction = {
  type : TransactionType;
  amount: number;
  timestamp: Date; 
  location : Coords;
  recipientAccount: string;
  deviceId: string;
  ipAddress?: string;
  reported? : boolean
};
export type TransactionType = "SEND" | "RECIEVE" | "WITHDRAW" | "PAY";

export interface Report{
  transation : Transaction,
  reason : string;
  reportedAt: string,
  reporterPhone: string
}

export type Coords = {
  latitude : number;
  longitude : number;
}


interface CardId {
    activationDate : CustomDate;
    id : string
}



interface CustomDate{
    year : number;
    month :  number;
    day : number;
}

export type User = {
    firstName : string;
    lastName : string;
    email? : string;
    nationIdNumber : string;
    dateOfBirth : CustomDate;
}


export class CardService {

    createCardId () : string{
        const userId = crypto.randomUUID();
        return userId
    }

    
    async verifyUser(cardNumber : string, user : User,onSuccess : ()=> void, onFailure : (reason : string) => void){
        const db = doc(firestoredb,"myBank/cards/all/" + cardNumber)
        const card = await this.getCardInfo(db)
        if(!card){
            return onFailure("This number is not registered")
        }
        const lower = (x : string) : string=>{
            return x.toLowerCase();
        }
    const cardHolder = card.cardHolder
    const {firstName,lastName,nationIdNumber,dateOfBirth} = cardHolder
    if(!(lower(firstName) == lower(user.firstName) && lower(lastName) == lower(user.lastName) && lower(nationIdNumber) == lower(user.nationIdNumber) && dateOfBirth.day == user.dateOfBirth.day && dateOfBirth.month == user.dateOfBirth.month && dateOfBirth.year == user.dateOfBirth.year)){
        return onFailure("Details don't match")
    }
    onSuccess()
    }

    async updateCardId(cardNumber : string,newId : string){
       const db = doc(firestoredb,"myBank/cards/all/" + cardNumber)
        await updateDoc(db,{cardId : {id : newId}})
    } 
    async simSwap(card : Card,user : User,onSuccess : ()=> void, onFailure : (reason : string) => void){
        try {
            await this.verifyUser(card.cardNumber,user, async()=>{
                await this.updateCardId(card.cardNumber, this.createCardId()).then(()=>(

                    onSuccess()
                )).catch(e=> onFailure(e.message))

            },onFailure)
            
        } catch (error) {
            console.log(error);
            onFailure("An Error has occurred")            
        }
    }

  async checkFraudTransaction(
  phoneNumber: string,
  onSuccess: (reports: Report[]) => void,
  onError: () => void
): Promise<void> {
  try {
    const myDb = collection(firestoredb, `myBank/fraud/reports/${phoneNumber}/all`);
    const docs = await getDocs(myDb);
    const reports = docs.docs.map(doc => doc.data() as Report);
    onSuccess(reports);
  } catch (error) {
    console.error(error);
    onError();
  }
}

async checkFraudTransactions(
  id: string,
  onResult: (reports: Report[]) => void
): Promise<void> {
  try {
    const fraudTransactionReports: Report[] = [];
    const mydb = collection(firestoredb, "myBank/cards/all/");
    const myQuery = query(mydb, where("cardHolder.nationIdNumber", "==", id));
    const querySnapshot = await getDocs(myQuery);
    const cards = querySnapshot.docs.map(doc => doc.data() as Card);

    await Promise.all(
      cards.map(card =>
        new Promise<void>((resolve) => {
          this.checkFraudTransaction(
            card.cardNumber,
            (reports) => {
              fraudTransactionReports.push(...reports);
              resolve();
            },
            () => {
              resolve();
            }
          );
        })
      )
    );

    onResult(fraudTransactionReports);
  } catch (error) {
    console.error(error);
  }
}





    async isNationalIdRegisteredBefore(id : string,onIsRegistered : (count : number)=> void, onIsNotRegistered : ()=> void, onError : ()=> void){
        try {
          const mydb = collection(firestoredb,"myBank/cards/all/")
          const myQuery = query(mydb,where("cardHolder.nationIdNumber","==",id))
          const querySnapshot = await getDocs(myQuery)
          if(querySnapshot.empty){
            return onIsNotRegistered()
          }
          const count = querySnapshot.docs.length
          onIsRegistered(count)            
        } catch (error) {
            console.log(error);
            onError()           
        }
    }


    async getCardInfo(db : DocumentReference<DocumentData, DocumentData> ) : Promise<Card | null>{
        const data = await getDoc(db)
        if(!data.exists()){
            return null
        }
        return data.data() as Card

    }


    async createCard(card : Card, onSuccess : ()=>void, onFailure : (reason : string)=> void){
        try {
            const db = doc(firestoredb,"myBank/cards/all/" + card.cardNumber)
            const userCard = await this.getCardInfo(db)
            if(userCard){
                return onFailure(`Card is already registered to another user : ${userCard.cardHolder.firstName + " " + userCard.cardHolder.lastName}`)
            }
            await setDoc(db, card)
            onSuccess()
            
        } catch (error) {
            console.log(error);
            onFailure("An error has occured")
            
            
        }
    }


}