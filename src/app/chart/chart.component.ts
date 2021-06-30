import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import { ActivatedRoute } from '@angular/router'
import { DataService } from 'src/services/dataservice.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {

  private chart: am4charts.XYChart;
  private unsubscribe: Subscription[] = [];
  public data = [];
  public chartData = [];

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone,
    private route: ActivatedRoute, public DataService: DataService) {
    // Get country name from query params
    let query = this.route.snapshot.paramMap.get('query')
    this.getdata(query);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  getdata(query) {
    const chartDataSubscr = this.DataService
      .countryData(query)
      .pipe(first())
      .subscribe((res: any) => {

        if (res) {
          Array.isArray(res) ? this.data = res : this.data.push(res)
        }

      });

    this.unsubscribe.push(chartDataSubscr);
  }

  ngAfterViewChecked() {
    // Chart code goes in here
    this.data.forEach(element => {
      let temp_array = {
        name: element.country,
        children: [
          { name: "Total Cases", value: element.cases },
          { name: "Recovered", value: element.recovered },
          { name: "Deaths", value: element.deaths },
          { name: "Active", value: element.active }
        ]
      }
      this.chartData.push(temp_array);
    });

    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("chartdiv", am4plugins_sunburst.Sunburst);

      chart.data = this.chartData

      chart.colors.step = 2;
      chart.dataFields.value = "value";
      chart.dataFields.name = "name";
      chart.dataFields.children = "children";
      chart.legend = new am4charts.Legend();
      chart.legend.maxHeight = 150;
      chart.legend.scrollable = true;

      //For Displaying Just Country Name in Legends
      var level0SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
      level0SeriesTemplate.hiddenInLegend = false;
      chart.seriesTemplates.setKey("0", level0SeriesTemplate)

      var level1SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("1", level1SeriesTemplate)
      level1SeriesTemplate.fillOpacity = 0.75;
      level1SeriesTemplate.hiddenInLegend = true;

      var level2SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("2", level2SeriesTemplate)
      level2SeriesTemplate.fillOpacity = 0.5;
      level2SeriesTemplate.hiddenInLegend = true;

      // For Responsive chart
      chart.responsive.enabled = true;
      chart.responsive.rules.push({
        relevant: function (target) {
          if (target.pixelWidth <= 600) {
            return true;
          }
          return false;
        },
        state: function (target, stateId) {
          if (target instanceof am4charts.PieSeries) {
            var state = target.states.create(stateId);

            var labelState = target.labels.template.states.create(stateId);
            labelState.properties.disabled = true;

            var tickState = target.ticks.template.states.create(stateId);
            tickState.properties.disabled = true;
            return state;
          }

          return null;
        }
      })
    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
