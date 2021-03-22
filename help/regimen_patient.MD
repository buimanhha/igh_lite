# MÔ TẢ CHI TIẾT STATE VÀ LIFE_CYCLE TRONG PHÁC ĐỒ

# Lifecycle

# State

| Index | Name                                            | Value      | Note                                                                                                                                                                                                               |
| ----- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | PATIENT_PRE_FILTER                              | null, 0, 1 | Trạng thái khi mới đăng kí xong hoặc sau khi bị clear phác đồ. Cân nhắc có phần expride date của phác đồ cho phép thực hiện lại lần nữa                                                                            |
| 2     | PATIENT_AFTER_FILTER_NOT_ALLOW_REGIMEN          | 11         | Trạng thái sau khi sàng lọc bộ câu hỏi nhưng không đáp ứng được điều kiện phác đồ                                                                                                                                  |
| 3     | PATIENT_STATE_IDLE                              | 2          | Trạng thái sau khi sàng lọc bộ câu hỏi và đáp ứng được điều kiện để thực hiện phác đồ                                                                                                                              |
| 4     | PATIENT_STATE_READY_ACTIVE                      | 3          | Trạng thái sau khi lựa chọn địa điểm uống thuốc, ngày nội soi và click vào "Kích hoạt phác đồ"                                                                                                                     |
| 5     | PATIENT_STATE_ACTIVE                            | 4          | Trạng thái đang thực hiện phác đồ, được update khi click "Bắt đầu" trong màn hình DetailRegimen                                                                                                                    |
| 6     | PATIENT_STATE_ACTIVE_SUSPEND                    | 41         | Trạng thái suspend sau khi người dùng thực hiện bấm nút SOS ở trong màn hình activeRegimen                                                                                                       |
| 6.1     | PATIENT_STATE_SUSPEND_NOT_ALLOW_SELF_ACTIVE                    | 41         | Trạng thái suspend sau khi người dùng thực hiện bấm nút Dừng ở trong màn hình activeRegimen, không cho kích hoạt lại                                                                                                       |
| 7     | PATIENT_STATE_WAIT_FOR_TIME_MORNING             | 4          | Trạng thái khi người dùng thực hiện phác đồ ở nhà, có các bước chuyển đổi giữa ban ngày và ban đêm, từ "everning" sang morning, khi đó cần WAITING cho tới thời điểm tiếp theo để bắt đầu thực hiện bước tiếp theo |
| 8     | PATIENT_STATE_CONFIRM                           | 5          | Trạng thái chờ confirm độ sạch sau khi thực hiện phác đồ                                                                                                                                                           |
| 9     | PATIENT_STATE_AFTER_CONFIRM                     | 6          | Trạng thái sau khi confirm độ sạch sau khi thực hiện phác đồ thành công                                                                                                                                            |
| 10    | PATIENT_STATE_POST_SUPPORT                      | 7          | Trạng thái sau khi thực hiện phác đồ và được confirm là sạch                                                                                                                                                       |
| 11    | PATIENT_STATE_POST_SUPPORT_NOT_ENOUGH_CONDITION | 8          | Trạng thái sau khi thực hiện phác đồ và được confirm là chưa sạch, chưa đủ điều kiện (tính kết quả cuối cùng sau khi hỏi hai lần)                                                                                  |

# Model description

## UserInfo
Thông tin profile của bệnh nhân

#### data_content
Thông tin lưu về hỗ trợ sau nội soi của bệnh nhân dưới dạng JSON string.
Các nội dung hiện tại lưu vào thành phần choices. Chi tiết như sau:

##### contentOverlay
Thông báo các thủ thuật của bệnh nhân đã chọn.

##### tags
Các chuyên mục bài viết hỗ trợ sau nội soi ứng với các thủ thuật của bệnh nhân đã chọn.

##### surgery
Phần tích chọn tên các thủ thuật của bệnh nhân đã chọn.

```json 
"data_content":"{\"choices\":{\"showOverlay\":true,\"contentOverlay\":\"Bạn xác nhận các thủ thuật đã được áp dụng trong quá trình nội soi là: Sinh thiết, Thắt trĩ, Siêu âm nội soi, \",\"step\":3,\"getResult\":false,\"reExaminationDayChose\":0,\"reExaminationDay\":\"2020-06-22T08:35:08.185Z\",\"getResultDay\":null,\"surgery\":[false,true,false,false,true,true,false],\"tags\":\"sinh thiết,thắt trĩ,siêu âm nội soi\"}}"

## RegimenOfPatient

#### eff_date

Thời điểm cần bắt đầu thực hiện phác đồ từ bước đầu tiên. Ví dụ lúc 19h tối hôm trước: 2020-04-25T12:00:00.000Z

#### exp_date

Thời điểm cần nội soi (theo lựa chọn thời điểm hẹn nội soi)

#### step_timing

Timing thực hiện các bước trong step. Được lưu theo định dạng json, nhưng đã được convert sang string.
Mỗi phần tử gồm có

- start_time: chứa thông tin của start_time thực hiện bước
- end_time: chứa thông tin của end_time thực hiện bước

<details><summary>View json example</summary>

```json
{
  "step_timing": [
    {
      "start_time": 1587865218289,
      "end_time": 1587865825000
    },
    {
      "start_time": 1587865825000,
      "end_time": 1587940741000
    },
    {
      "start_time": 1587940741000,
      "end_time": 1587946518677
    },
    {
      "start_time": 1587946518677,
      "end_time": 1587953810281
    },
    {
      "start_time": 1587953810281,
      "end_time": 1587956865075
    },
    {
      "start_time": 1587956865075,
      "end_time": 1587959237539
    }
  ]
}
```

</details>

#### other_data

Gồm có 3 mảng object con: quests, answer, confirmRegimen

##### quests: 
Chứa thông tin các câu hỏi mà người dùng đã làm sàng lọc, ví dụ:
<details><summary>View json example</summary>

```json
{
  "quests": [
    {
      "id": 1,
      "index": 1,
      "quest": "Bạn có một trong các triệu chứng sau đây không ?",
      "created_at": "2020-03-22T13:21:25.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": null,
      "ids": [
        {
          "id": 6,
          "index": 6,
          "quest": "Sốt",
          "created_at": "2020-04-11T03:13:43.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 7,
          "index": 7,
          "quest": "Không đi ngoài được trong 3 ngày gần đây",
          "created_at": "2020-04-11T03:14:20.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        }
      ]
    },
    {
      "id": 2,
      "index": 2,
      "quest": "Bạn đã từng dị ứng (thuốc, thức ăn, thời tiết..), nổi mày đay chưa ?",
      "created_at": "2020-03-22T13:21:48.000Z",
      "updated_at": "2020-04-16T16:09:58.000Z",
      "parentId": null,
      "ids": []
    }
  ]
}
```
</details>

##### answer: 
Chứa câu trả lời cho các câu hỏi đã làm sàng lọc
<details><summary>View json example</summary>
```json
{
  "answer": [
    [false, false, false, false, false, false],
    false,
    [false, false, false, false, false],
    false,
    [false, false, false]
  ]
}
```
</details>

##### confirmRegimen: 
Chứa số lần trả lời cho câu hỏi chất lượng sau thực hiện phác đồ
<details><summary>View json example</summary>

```json
{
  "confirmRegimen": {
    "waitConfirmTime": 1587959237540,
    "startConfirmTime": 1587959237540,
    "confirmNumber": 0
  }
}
```
</details>

##### Chi tiết

<details><summary>View detail</summary>

```json
{
  "quests": [
    {
      "id": 1,
      "index": 1,
      "quest": "Bạn có một trong các triệu chứng sau đây không ?",
      "created_at": "2020-03-22T13:21:25.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": null,
      "ids": [
        {
          "id": 6,
          "index": 6,
          "quest": "Sốt",
          "created_at": "2020-04-11T03:13:43.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 7,
          "index": 7,
          "quest": "Không đi ngoài được trong 3 ngày gần đây",
          "created_at": "2020-04-11T03:14:20.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 8,
          "index": 8,
          "quest": "Không đánh hơi được",
          "created_at": "2020-04-11T03:14:38.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 9,
          "index": 9,
          "quest": "Nôn nhiều",
          "created_at": "2020-04-11T03:14:50.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 10,
          "index": 10,
          "quest": "Căng cứng bụng, chướng bụng nhiều",
          "created_at": "2020-04-11T03:15:04.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        },
        {
          "id": 11,
          "index": 11,
          "quest": "Đau dữ dội như dao đâm",
          "created_at": "2020-04-11T03:17:16.000Z",
          "updated_at": "2020-04-16T16:09:51.000Z",
          "parentId": 1
        }
      ]
    },
    {
      "id": 2,
      "index": 2,
      "quest": "Bạn đã từng dị ứng (thuốc, thức ăn, thời tiết..), nổi mày đay chưa ?",
      "created_at": "2020-03-22T13:21:48.000Z",
      "updated_at": "2020-04-16T16:09:58.000Z",
      "parentId": null,
      "ids": []
    },
    {
      "id": 3,
      "index": 3,
      "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
      "created_at": "2020-03-22T13:22:01.000Z",
      "updated_at": "2020-04-16T16:10:03.000Z",
      "parentId": null,
      "ids": [
        {
          "id": 12,
          "index": 12,
          "quest": "Suy tim/ gan/ thận ",
          "created_at": "2020-04-11T03:17:50.000Z",
          "updated_at": "2020-04-16T16:11:47.000Z",
          "parentId": 3
        },
        {
          "id": 13,
          "index": 13,
          "quest": "Bệnh lý tim mạch, ví dụ: tăng huyết áp ≥150/100mmHg, bệnh mạch vành, rối loạn nhịp tim",
          "created_at": "2020-04-11T03:18:12.000Z",
          "updated_at": "2020-04-16T16:10:03.000Z",
          "parentId": 3
        },
        {
          "id": 14,
          "index": 14,
          "quest": "Đái tháo đường",
          "created_at": "2020-04-11T03:18:29.000Z",
          "updated_at": "2020-04-16T16:10:03.000Z",
          "parentId": 3
        },
        {
          "id": 15,
          "index": 15,
          "quest": "Ung thư đại tràng ",
          "created_at": "2020-04-11T03:18:44.000Z",
          "updated_at": "2020-04-16T16:10:03.000Z",
          "parentId": 3
        },
        {
          "id": 16,
          "index": 16,
          "quest": "Hen phế quản",
          "created_at": "2020-04-11T03:19:03.000Z",
          "updated_at": "2020-04-16T16:10:03.000Z",
          "parentId": 3
        }
      ]
    },
    {
      "id": 4,
      "index": 4,
      "quest": "Bạn có đang bị tiêu chảy, rối loạn điện giải, mất nước ?",
      "created_at": "2020-04-09T15:02:27.000Z",
      "updated_at": "2020-04-16T16:10:08.000Z",
      "parentId": null,
      "ids": []
    },
    {
      "id": 5,
      "index": 5,
      "quest": "Bạn đang điều trị một trong các loại thuốc sau đây không ?",
      "created_at": "2020-04-09T15:03:17.000Z",
      "updated_at": "2020-04-16T16:10:15.000Z",
      "parentId": null,
      "ids": [
        {
          "id": 17,
          "index": 17,
          "quest": "Thuốc tâm thần kinh, ví dụ: trầm cảm, mất ngủ",
          "created_at": "2020-04-16T16:12:28.000Z",
          "updated_at": "2020-04-16T16:12:36.000Z",
          "parentId": 5
        },
        {
          "id": 18,
          "index": 18,
          "quest": "Thuốc gây nghiện",
          "created_at": "2020-04-16T16:12:58.000Z",
          "updated_at": "2020-04-16T16:12:58.000Z",
          "parentId": 5
        },
        {
          "id": 19,
          "index": 19,
          "quest": "Thuốc chống đông",
          "created_at": "2020-04-16T16:13:20.000Z",
          "updated_at": "2020-04-16T16:13:20.000Z",
          "parentId": 5
        }
      ]
    },
    {
      "id": 6,
      "index": 6,
      "quest": "Sốt",
      "created_at": "2020-04-11T03:13:43.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 7,
      "index": 7,
      "quest": "Không đi ngoài được trong 3 ngày gần đây",
      "created_at": "2020-04-11T03:14:20.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 8,
      "index": 8,
      "quest": "Không đánh hơi được",
      "created_at": "2020-04-11T03:14:38.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 9,
      "index": 9,
      "quest": "Nôn nhiều",
      "created_at": "2020-04-11T03:14:50.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 10,
      "index": 10,
      "quest": "Căng cứng bụng, chướng bụng nhiều",
      "created_at": "2020-04-11T03:15:04.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 11,
      "index": 11,
      "quest": "Đau dữ dội như dao đâm",
      "created_at": "2020-04-11T03:17:16.000Z",
      "updated_at": "2020-04-16T16:09:51.000Z",
      "parentId": {
        "id": 1,
        "index": 1,
        "quest": "Bạn có một trong các triệu chứng sau đây không ?",
        "created_at": "2020-03-22T13:21:25.000Z",
        "updated_at": "2020-04-16T16:09:51.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 12,
      "index": 12,
      "quest": "Suy tim/ gan/ thận ",
      "created_at": "2020-04-11T03:17:50.000Z",
      "updated_at": "2020-04-16T16:11:47.000Z",
      "parentId": {
        "id": 3,
        "index": 3,
        "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
        "created_at": "2020-03-22T13:22:01.000Z",
        "updated_at": "2020-04-16T16:10:03.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 13,
      "index": 13,
      "quest": "Bệnh lý tim mạch, ví dụ: tăng huyết áp ≥150/100mmHg, bệnh mạch vành, rối loạn nhịp tim",
      "created_at": "2020-04-11T03:18:12.000Z",
      "updated_at": "2020-04-16T16:10:03.000Z",
      "parentId": {
        "id": 3,
        "index": 3,
        "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
        "created_at": "2020-03-22T13:22:01.000Z",
        "updated_at": "2020-04-16T16:10:03.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 14,
      "index": 14,
      "quest": "Đái tháo đường",
      "created_at": "2020-04-11T03:18:29.000Z",
      "updated_at": "2020-04-16T16:10:03.000Z",
      "parentId": {
        "id": 3,
        "index": 3,
        "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
        "created_at": "2020-03-22T13:22:01.000Z",
        "updated_at": "2020-04-16T16:10:03.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 15,
      "index": 15,
      "quest": "Ung thư đại tràng ",
      "created_at": "2020-04-11T03:18:44.000Z",
      "updated_at": "2020-04-16T16:10:03.000Z",
      "parentId": {
        "id": 3,
        "index": 3,
        "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
        "created_at": "2020-03-22T13:22:01.000Z",
        "updated_at": "2020-04-16T16:10:03.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 16,
      "index": 16,
      "quest": "Hen phế quản",
      "created_at": "2020-04-11T03:19:03.000Z",
      "updated_at": "2020-04-16T16:10:03.000Z",
      "parentId": {
        "id": 3,
        "index": 3,
        "quest": "Bạn đã từng hoặc đang mắc các bệnh lí mạn tính nặng cần theo dõi điều trị sau đây không ?  ",
        "created_at": "2020-03-22T13:22:01.000Z",
        "updated_at": "2020-04-16T16:10:03.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 17,
      "index": 17,
      "quest": "Thuốc tâm thần kinh, ví dụ: trầm cảm, mất ngủ",
      "created_at": "2020-04-16T16:12:28.000Z",
      "updated_at": "2020-04-16T16:12:36.000Z",
      "parentId": {
        "id": 5,
        "index": 5,
        "quest": "Bạn đang điều trị một trong các loại thuốc sau đây không ?",
        "created_at": "2020-04-09T15:03:17.000Z",
        "updated_at": "2020-04-16T16:10:15.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 18,
      "index": 18,
      "quest": "Thuốc gây nghiện",
      "created_at": "2020-04-16T16:12:58.000Z",
      "updated_at": "2020-04-16T16:12:58.000Z",
      "parentId": {
        "id": 5,
        "index": 5,
        "quest": "Bạn đang điều trị một trong các loại thuốc sau đây không ?",
        "created_at": "2020-04-09T15:03:17.000Z",
        "updated_at": "2020-04-16T16:10:15.000Z",
        "parentId": null
      },
      "ids": []
    },
    {
      "id": 19,
      "index": 19,
      "quest": "Thuốc chống đông",
      "created_at": "2020-04-16T16:13:20.000Z",
      "updated_at": "2020-04-16T16:13:20.000Z",
      "parentId": {
        "id": 5,
        "index": 5,
        "quest": "Bạn đang điều trị một trong các loại thuốc sau đây không ?",
        "created_at": "2020-04-09T15:03:17.000Z",
        "updated_at": "2020-04-16T16:10:15.000Z",
        "parentId": null
      },
      "ids": []
    }
  ],
  "answer": [
    [false, false, false, false, false, false],
    false,
    [false, false, false, false, false],
    false,
    [false, false, false]
  ],
  "confirmRegimen": {
    "startConfirmTime": 1587959237540,
    "confirmNumber": 0
  }
}
```
</details>