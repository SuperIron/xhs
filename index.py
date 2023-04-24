from openpyxl import Workbook
from xhs import FeedType, XhsClient
from time import sleep
# 引入pandas库
import pandas as pd

COOKIE = "xhsTrackerId=8df20492-767e-4cd4-a9d1-f80e6c8221df; xhsTrackerId.sig=JmsZRTl4h9HsAWxgtp49pi7ZUzUDa6lyLmmGDyHRL0g; a1=1879dd44c22f695cynzhicn3v3kxtsiyqdksjbl8u50000415160; webId=0a0a2f2973954fb5fa9a8ba2a52905ec; gid=yYWjff44SKADyYWjff44SfD1JJiKj2SvIux3TY7SIqhqTM28C9M3vV8884y2yK88fW8KdfD0; gid.sign=xNpA2r/P1lGf8cZ2cF52oOQTF+Q=; web_session=040069b02bf9032d2428736074364bbc0844f6; smidV2=202304202109411ec5d2a8251c924f13a993f0b9cf978300c2f0ed3b98e2ac0; extra_exp_ids=yamcha_0327_exp,h5_1208_exp3,ques_exp1; extra_exp_ids.sig=w9AsUUGxef90M-4Z5VfjRwwhB2K939rTZnKSUXm2_EI; webBuild=2.1.1; xsecappid=xhs-pc-web; acw_tc=dc96d220f6549863a06eaec5d02b169499cbf4556e0c60bce2fc566ac1b2f669; websectiga=cf46039d1971c7b9a650d87269f31ac8fe3bf71d61ebf9d9a0a87efb414b816c; sec_poison_id=5d486b32-5000-4b94-b4c3-28c7a340dbbf"
MAX_COUNT = 10

notes = []
page = 1

xhs_client = XhsClient(COOKIE)

while True:
    print("page: ", page)
    data = xhs_client.get_note_by_keyword("柴犬", page=page)
    for item in data.get('items'):
        id = item.get('id')
        note_card = item.get('note_card')
        display_title = note_card.get('display_title')
        note_info = xhs_client.get_note_by_id(id)
        desc = note_info.get('desc')
        interact_info = note_info.get('interact_info')
        time = note_info.get('time')
        print(note_info)
        notes.append({
            'id': id,
            'display_title': display_title,
            'desc': desc,
            'collected_count': interact_info.get('collected_count'),
            "liked_count": interact_info.get("liked_count"),
            'time': time
        })
        sleep(2)
    if len(notes) >= MAX_COUNT or not data.get('has_more'):
        break
    page += 1
    sleep(2)

print(notes)
df = pd.DataFrame(notes)
# 导出xlsx，如果想要csv格式，那么使用to_csv方法也一样
df.to_excel('db.xlsx')
