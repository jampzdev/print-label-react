import { LabelData } from '../types';
import { imagePathToZpl } from './imageToZplService';
const hostName = "http://localhost:5173/"
const uploadPath = "/uploads"

export const getZplFormat = async (
    labelData: LabelData,
    labelType: string,
    labelType2: string
  ): Promise<string> => {
    let zpl = ''
    let dpi = 203

    switch(labelType){
        case "Model Name" :
            if(labelType2==="front"){
                console.log("kapayapaan",labelData)

                const labelWidth = Math.round(labelData.cartonWidth * dpi); 
                const labelHeight = Math.round(labelData.cartonHeight * dpi); 

                const text = labelData.modelName;
                const font = 80; // based on font size
                
                const x = getCenteredXPosition(labelWidth, text, font);
                const y = getCenteredYPosition(labelHeight, text, font);

                let imgFullPath = hostName + uploadPath + labelData.userManualQr

                let imgToZplRes = await imagePathToZpl(imgFullPath)
              
                zpl = `
                ^XA
            ^PW1016
            ^LL0508
            
            ^CI28
            ^FO${x},${y-120}^A0N,${font},${font}^FDPro Splitter 5^FS
            ^FO${x},${y}^A0N,${font},${font}^FD${labelData.modelName}^FS
            ^FO${x},${y+80}^A0N,${font-20},${font-50}^FD${labelData.brandName}^FS
            ^FO${x+120},${y+120}${imgToZplRes}^FS
            ^XZ`

            }
            else{
                zpl = `
                ^XA
            ^PW1016
            ^LL0508
            
            ^CI28
            
            ^FO30,30^A0N,30,30^FD产品名称: ${labelData.categoryName} 音频信号分配器^FS
            ^FO30,70^A0N,30,30^FD品牌型号: ${labelData.brandName},${labelData.modelName}^FS
            ^FO30,110^A0N,30,30^FDN.W. 9.46 lbs/4.30 kg^FS
            ^FO30,150^A0N,30,30^FDG.W. 12.32 lbs/5.60 kg^FS
            ^FO30,190^A0N,30,30^FDSIZE: 21.5 x 12.3 x 7.3"/546 x 314 x 186 mm^FS
            ^FO30,230^A0N,30,30^FD执行标准: GB 4943.1-2022; GB/T 9254.1-2021; GB 17625.1-2022^FS
            ^FO30,270^A0N,30,30^FD生产企业: 中山欧悦电子有限公司^FS
            ^FO30,310^A0N,30,30^FD中山市南朗街道翠亨村松苑路东悦路10号^FS
            ^FO30,350^A0N,30,30^FDMade in China 中国制造^FS
            
            ^FO30,400^A0N,40,40^FD10 PCS^FS
            
            ^FO30,450^BY2
            ^BCN,100,Y,N,N
            ^FD>:4033653231923^FS
            
            ^FO30,570^A0N,30,30^FDUPC-A^FS
            ^FO30,610^BY2
            ^BEN,100,Y,N
            ^FD644216648200^FS
            
            ^FO400,30^XGCEICON.GRF,1,1^FS
            
            ^XZ`
            }
        break;
    }

  return zpl;
};

export const getCenteredXPosition = (
    labelWidth : number,
    text : string,
    fontWidth : number
): number => {
    const textPixelWidth = text.length * fontWidth;
    const x = Math.max(0, Math.floor((labelWidth - textPixelWidth) / 2));
    return x;
}

export const getCenteredYPosition = (
    labelHeight : number,
    text : string,
    fontHeight : number
): number => {
    const textPixelWidth = fontHeight;
    const x = Math.max(0, Math.floor((labelHeight - textPixelWidth) / 2));
    return x;
}