function main () {
   function percentageAdjustment(theAdSchedule){
       /perform bid adjustments by % on audience segments/
       var oldBid = theAdSchedule.getBidModifier(); 
        if(oldBid != 0){ 
           var newBid = oldBid - .10;
           theAdSchedule.setBidModifier(newBid);
           console.log(theAdSchedule.getBidModifier());  
       }
    }
    
    function binaryAdjustment(theAdSchedule){
      //perform enable or exclude
      theAdSchedule.remove();
    }
    
  const percentIncrease = 50; 
  const minClicks = 20; 
  const minConversions = 5;
    
    for (const campaign of AdsApp.campaigns()) { 
     var active = campaign.isEnabled();
       if (active && !campaign.isExperimentCampaign()){
         var campaignName = campaign.getName();
         var biddingType = campaign.getBiddingStrategyType();
         console.log(`${campaign.getName()}; 
         active? ${campaign.isEnabled()}; `);  
         console.log(biddingType);
         
         var stats = campaign.getStatsFor("ALL_TIME");
         var conversions = stats.getConversions();   
         var cost = stats.getCost();
         var cCostConv = cost/conversions; 
         console.log('campaign cost/conv:' + cCostConv);
         
         var adScheduleSelector = campaign.targeting()
          .adSchedules()
          .forDateRange("ALL_TIME")
          .orderBy("metrics.clicks DESC");

         var adScheduleIterator = adScheduleSelector.get();
          while (adScheduleIterator.hasNext()) {
           var adSchedule = adScheduleIterator.next();
           var getFirstHour = adSchedule.getStartHour();
           var getLastHour = adSchedule.getEndHour();
           var convertedFirstHour = getFirstHour%12;
           var convertedLastHour = getLastHour%12;
            if(getFirstHour == 12) {
              /*if first hour is noon and last hour is pm*/
              console.log(adSchedule.getDayOfWeek() + ': ' + getFirstHour + 'pm' + ' - ' + convertedLastHour + 'pm');
            }else if(getLastHour == 12) {
              /*if first hour is am and last hour is noon*/
              console.log(adSchedule.getDayOfWeek() + ': ' + getFirstHour + 'am' + ' - ' + '12' + 'pm');
            }else if(getFirstHour == 0) {
              /*if first hour is midnight and last hour is am*/
              console.log(adSchedule.getDayOfWeek() + ': ' + '12' + 'am' + ' - ' + getLastHour + 'am');
            }else if(getLastHour == 24) {
             /*if beginning is pm and end is midnight*/ 
              console.log(adSchedule.getDayOfWeek() + ': ' + convertedFirstHour + 'pm' + ' - ' + '12' + 'am' );
            }else if(convertedFirstHour != getFirstHour && convertedLastHour != getLastHour) {
              /*if first hour is pm and last hour is pm*/
              console.log(adSchedule.getDayOfWeek() + ': ' + convertedFirstHour + 'pm' + ' - ' + convertedLastHour + 'pm');
            }else if(convertedFirstHour == getFirstHour && convertedLastHour == getLastHour) {
             /*if beginning is am and end is am*/
              console.log(adSchedule.getDayOfWeek() + ': ' + getFirstHour + 'am' + ' - ' + getLastHour + 'am');
            }
            
             
           var adScheduleStats = adSchedule.getStatsFor("ALL_TIME");
           var adScheduleCost = adScheduleStats.getCost(); 
           var adScheduleConversions = adScheduleStats.getConversions(); 
           var adScheduleClicks = adScheduleStats.getClicks(); 
            if (adScheduleConversions > minConversions && adScheduleClicks > minClicks){
              var adScheduleCostConv = adScheduleCost/adScheduleConversions;
              var difference = adScheduleCostConv - cCostConv;
              var increase = (difference/cCostConv) * 100;
              /*change to increase >= percentIncrease for live implementation*/
                  if(increase >= percentIncrease){
                    console.log(increase);
                       if(biddingType === 'MAXIMIZE_CONVERSIONS'){
                         binaryAdjustment(adSchedule); 
                       }
                       if(biddingType === 'TARGET_SPEND'){
                         percentageAdjustment(adSchedule); 
                        }
                  }
            }else if (adScheduleConversions == 0 && adScheduleClicks > minClicks) {
              var difference = adScheduleCost - cCostConv; 
              var increase = (difference/cCostConv) * 100;
              
                if(increase >= percentIncrease){
                  console.log(increase);
                    if(biddingType === 'MAXIMIZE_CONVERSIONS'){                                        
                      binaryAdjustment(adSchedule); 
                    }
                    if(biddingType === 'TARGET_SPEND'){        
                      percentageAdjustment(adSchedule); 
                    }
                 }
            } /*end of if no conversions & more than 20 clicks condition*/
           } /* end of audience iterator*/ 
           
       } /*end of if active campaign loop*/ 
          
    } /*end of campaign loop*/
} /*end of main loop*/
