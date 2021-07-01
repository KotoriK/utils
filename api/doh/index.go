//https://github.com/KotoriK/doh-lookup/blob/main/doh/lookup.go
package doh

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strconv"
)

type RecordType int

/*see also:https://help.aliyun.com/document_detail/171666.html
 */
const (
	TYPE_A     RecordType = 1
	TYPE_NS    RecordType = 2
	TYPE_CNAME RecordType = 5
	TYPE_SOA   RecordType = 6
	TYPE_TXT   RecordType = 16
	TYPE_AAAA  RecordType = 28
)

type QueryAnswerWithStringType struct {
	Name string `json:"name"`
	Type string `json:"type"`
	TTL  int
	Data string `json:"data"`
}
type QueryAnswer struct {
	Name string `json:"name"`
	Type int    `json:"type"`
	TTL  int
	Data string `json:"data"`
}
type QueryQuestion struct {
	Name string `json:"name"`
	Type int    `json:"type"`
}
type QueryQuestionWithStringType struct {
	Name string `json:"name"`
	Type string `json:"type"`
}
type QueryResult struct {
	Status   int
	TC       bool
	RD       bool
	RA       bool
	AD       bool
	CD       bool
	Question []QueryQuestion
	Answer   []QueryAnswer
}

/*
name: domain name
type: Query Type (either a numeric value or text) (optional to some dns service, provide "" in this case)
do: DO bit - set if client wants DNSSEC data (either boolean or numeric value)
cd: CD bit - set to disable validation (either boolean or numeric value)
@see https://developers.cloudflare.com/1.1.1.1/dns-over-https/json-format
[default value]
do: true
cd: false
*/
func Query(dns_domain string, name string, record_type string, do bool, cd bool) (QueryResult, error) {
	client := &http.Client{}
	params := url.Values{}
	params.Set("name", name)
	if record_type != "" {
		params.Set("type", record_type)
	}
	if do {
		params.Set("do", "true")
	} else {
		params.Set("do", "false")
	}
	if cd {
		params.Set("cd", "true")

	} else {
		params.Set("cd", "true")
	}
	req, err := http.NewRequest("GET", "https://"+dns_domain+"/dns-query?"+params.Encode(), nil)
	req.Header.Add("accept", "application/dns-json")
	resp, err := client.Do(req)
	result := QueryResult{}

	if err != nil {
		return result, err
	}
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		//2xx
		decoder := json.NewDecoder(resp.Body)
		err := decoder.Decode(&result)
		return result, err
	} else {
		return result, errors.New("HTTP Error:" + strconv.Itoa(resp.StatusCode) + " " + resp.Status)
	}
}
func ParseTypeInQueryAnswer(answer QueryAnswer) QueryAnswerWithStringType {
	type_str, _ := DecodeType(answer.Type)
	return QueryAnswerWithStringType{
		answer.Name, type_str, answer.TTL, answer.Data}
}
func DecodeType(type_num int) (string, error) {
	switch type_num {
	case 1:
		return "A", nil
	case 2:
		return "NS", nil
	case 5:
		return "CNAME", nil
	case 6:
		return "SOA", nil
	case 16:
		return "TXT", nil
	case 28:
		return "AAAA", nil
	default:
		return "", errors.New("unknown type")
	}
}

func EncodeType(type_string string) (int, error) {
	switch type_string {
	case "A":
		return 1, nil
	case "NS":
		return 2, nil
	case "CNAME":
		return 5, nil
	case "SOA":
		return 6, nil
	case "TXT":
		return 16, nil
	case "AAAA":
		return 28, nil
	default:
		return 0, errors.New("unknown type")
	}
}

type Result struct {
	Ok   bool        `json:"ok"`
	Data interface{} `json:"data"`
}

func Handler(writter http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	var dns_domain string
	_dns_domain := query.Get("dns_domain")
	if _dns_domain == "" {
		dns_domain = "cloudflare-dns.com"
	} else {
		dns_domain = _dns_domain
	}
	name := query.Get("name")

	var record_type string
	_record_type := query.Get("record_type")
	if _record_type == "" {
		dns_domain = "AAAA"
	} else {
		dns_domain = _record_type
	}
	var res Result
	type_int, err := EncodeType(dns_domain)
	if err != nil {
		res = Result{
			Ok:   false,
			Data: err,
		}
	} else {
		result, err := Query(strconv.Itoa(type_int), name, record_type, true, false)
		if err != nil {
			res = Result{
				Ok:   true,
				Data: result,
			}
		} else {
			res = Result{
				Ok:   false,
				Data: err,
			}
		}
	}
	json.NewEncoder(writter).Encode(res)
}
