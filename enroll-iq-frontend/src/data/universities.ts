// University data from QS World Rankings 2024
export interface University {
  value: string
  label: string
  country: string
  city: string
  rank: number
  overallScore: number
  id: number
}

// Helper to generate value from name
function generateValue(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

export const universities: University[] = [
  { id: 1, value: 'mit', label: 'Massachusetts Institute of Technology (MIT)', country: 'USA', city: 'Cambridge', rank: 1, overallScore: 100 },
  { id: 2, value: 'imperial', label: 'Imperial College London', country: 'UK', city: 'London', rank: 2, overallScore: 98.5 },
  { id: 3, value: 'oxford', label: 'University of Oxford', country: 'UK', city: 'Oxford', rank: 3, overallScore: 96.9 },
  { id: 4, value: 'harvard', label: 'Harvard University', country: 'USA', city: 'Cambridge', rank: 4, overallScore: 96.8 },
  { id: 5, value: 'cambridge', label: 'University of Cambridge', country: 'UK', city: 'Cambridge', rank: 5, overallScore: 96.7 },
  { id: 6, value: 'stanford', label: 'Stanford University', country: 'USA', city: 'Stanford', rank: 6, overallScore: 96.1 },
  { id: 7, value: 'eth_zurich', label: 'ETH Zurich', country: 'Switzerland', city: 'Zürich', rank: 7, overallScore: 93.9 },
  { id: 8, value: 'nus', label: 'National University of Singapore (NUS)', country: 'Singapore', city: 'Singapore', rank: 8, overallScore: 93.7 },
  { id: 9, value: 'ucl', label: 'UCL', country: 'UK', city: 'London', rank: 9, overallScore: 91.6 },
  { id: 10, value: 'caltech', label: 'California Institute of Technology (Caltech)', country: 'USA', city: 'Pasadena', rank: 10, overallScore: 90.9 },
  { id: 11, value: 'upenn', label: 'University of Pennsylvania', country: 'USA', city: 'Philadelphia', rank: 11, overallScore: 90.3 },
  { id: 12, value: 'berkeley', label: 'University of California, Berkeley (UCB)', country: 'USA', city: 'Berkeley', rank: 12, overallScore: 90.1 },
  { id: 13, value: 'melbourne', label: 'The University of Melbourne', country: 'Australia', city: 'Parkville', rank: 13, overallScore: 88.9 },
  { id: 14, value: 'peking', label: 'Peking University', country: 'China', city: 'Beijing', rank: 14, overallScore: 88.5 },
  { id: 15, value: 'ntu_singapore', label: 'Nanyang Technological University, Singapore (NTU Singapore)', country: 'Singapore', city: 'Singapore', rank: 15, overallScore: 88.4 },
  { id: 16, value: 'cornell', label: 'Cornell University', country: 'USA', city: 'Ithaca', rank: 16, overallScore: 87.9 },
  { id: 17, value: 'hku', label: 'The University of Hong Kong', country: 'Hong Kong SAR', city: 'Hong Kong', rank: 17, overallScore: 87.6 },
  { id: 18, value: 'sydney', label: 'The University of Sydney', country: 'Australia', city: 'Sydney', rank: 18, overallScore: 87.3 },
  { id: 19, value: 'unsw', label: 'The University of New South Wales (UNSW Sydney)', country: 'Australia', city: 'Sydney', rank: 19, overallScore: 87.1 },
  { id: 20, value: 'tsinghua', label: 'Tsinghua University', country: 'China', city: 'Beijing', rank: 20, overallScore: 86.5 },
  { id: 21, value: 'chicago', label: 'University of Chicago', country: 'USA', city: 'Chicago', rank: 21, overallScore: 86.2 },
  { id: 22, value: 'princeton', label: 'Princeton University', country: 'USA', city: 'Princeton', rank: 22, overallScore: 85.5 },
  { id: 23, value: 'yale', label: 'Yale University', country: 'USA', city: 'New Haven', rank: 23, overallScore: 85.2 },
  { id: 24, value: 'psl', label: 'Université PSL', country: 'France', city: 'Paris', rank: 24, overallScore: 84.7 },
  { id: 25, value: 'toronto', label: 'University of Toronto', country: 'Canada', city: 'Toronto', rank: 25, overallScore: 84.1 },
  { id: 26, value: 'epfl', label: 'EPFL École polytechnique fédérale de Lausanne', country: 'Switzerland', city: 'Lausanne', rank: 26, overallScore: 83.5 },
  { id: 27, value: 'edinburgh', label: 'The University of Edinburgh', country: 'UK', city: 'Edinburgh', rank: 27, overallScore: 83.3 },
  { id: 28, value: 'tu_munich', label: 'Technical University of Munich', country: 'Germany', city: 'Munich', rank: 28, overallScore: 83.2 },
  { id: 29, value: 'mcgill', label: 'McGill University', country: 'Canada', city: 'Montreal', rank: 29, overallScore: 83.0 },
  { id: 30, value: 'anu', label: 'Australian National University (ANU)', country: 'Australia', city: 'Canberra', rank: 30, overallScore: 82.4 },
  { id: 31, value: 'seoul_national', label: 'Seoul National University', country: 'South Korea', city: 'Seoul', rank: 31, overallScore: 82.3 },
  { id: 32, value: 'jhu', label: 'Johns Hopkins University', country: 'USA', city: 'Baltimore', rank: 32, overallScore: 82.1 },
  { id: 33, value: 'tokyo', label: 'The University of Tokyo', country: 'Japan', city: 'Tokyo', rank: 32, overallScore: 82.1 },
  { id: 34, value: 'columbia', label: 'Columbia University', country: 'USA', city: 'New York City', rank: 34, overallScore: 82.0 },
  { id: 35, value: 'manchester', label: 'The University of Manchester', country: 'UK', city: 'Manchester', rank: 34, overallScore: 82.0 },
  { id: 36, value: 'cuhk', label: 'The Chinese University of Hong Kong (CUHK)', country: 'Hong Kong SAR', city: 'Hong Kong', rank: 36, overallScore: 81.3 },
  { id: 37, value: 'monash', label: 'Monash University', country: 'Australia', city: 'Melbourne', rank: 37, overallScore: 81.2 },
  { id: 38, value: 'ubc', label: 'University of British Columbia', country: 'Canada', city: 'Vancouver', rank: 38, overallScore: 81.0 },
  { id: 39, value: 'fudan', label: 'Fudan University', country: 'China', city: 'Shanghai', rank: 39, overallScore: 80.3 },
  { id: 40, value: 'kcl', label: "King's College London", country: 'UK', city: 'London', rank: 40, overallScore: 80.2 },
  { id: 41, value: 'queensland', label: 'The University of Queensland', country: 'Australia', city: 'Brisbane City', rank: 40, overallScore: 80.2 },
  { id: 42, value: 'ucla', label: 'University of California, Los Angeles (UCLA)', country: 'USA', city: 'Los Angeles', rank: 42, overallScore: 79.8 },
  { id: 43, value: 'nyu', label: 'New York University (NYU)', country: 'USA', city: 'New York City', rank: 43, overallScore: 79.6 },
  { id: 44, value: 'michigan', label: 'University of Michigan-Ann Arbor', country: 'USA', city: 'Ann Arbor', rank: 44, overallScore: 79.0 },
  { id: 45, value: 'sjtu', label: 'Shanghai Jiao Tong University', country: 'China', city: 'Shanghai', rank: 45, overallScore: 77.8 },
  { id: 46, value: 'ip_paris', label: 'Institut Polytechnique de Paris', country: 'France', city: 'Palaiseau Cedex', rank: 46, overallScore: 77.5 },
  { id: 47, value: 'hkust', label: 'The Hong Kong University of Science and Technology', country: 'Hong Kong SAR', city: 'Hong Kong', rank: 47, overallScore: 77.1 },
  { id: 48, value: 'zhejiang', label: 'Zhejiang University', country: 'China', city: 'Hangzhou', rank: 47, overallScore: 77.1 },
  { id: 49, value: 'delft', label: 'Delft University of Technology', country: 'Netherlands', city: 'Delft', rank: 49, overallScore: 77.0 },
  { id: 50, value: 'kyoto', label: 'Kyoto University', country: 'Japan', city: 'Kyoto', rank: 50, overallScore: 76.0 },
  { id: 51, value: 'northwestern', label: 'Northwestern University', country: 'USA', city: 'Evanston', rank: 50, overallScore: 76.0 },
  { id: 52, value: 'lse', label: 'The London School of Economics and Political Science (LSE)', country: 'UK', city: 'London', rank: 50, overallScore: 76.0 },
  { id: 53, value: 'kaist', label: 'KAIST - Korea Advanced Institute of Science & Technology', country: 'South Korea', city: 'Daejeon', rank: 53, overallScore: 75.7 },
  { id: 54, value: 'bristol', label: 'University of Bristol', country: 'UK', city: 'Bristol', rank: 54, overallScore: 75.4 },
  { id: 55, value: 'amsterdam', label: 'University of Amsterdam', country: 'Netherlands', city: 'Amsterdam', rank: 55, overallScore: 73.7 },
  { id: 56, value: 'yonsei', label: 'Yonsei University', country: 'South Korea', city: 'Seoul', rank: 56, overallScore: 72.9 },
  { id: 57, value: 'polyu', label: 'The Hong Kong Polytechnic University', country: 'Hong Kong SAR', city: 'Hong Kong', rank: 57, overallScore: 72.1 },
  { id: 58, value: 'cmu', label: 'Carnegie Mellon University', country: 'USA', city: 'Pittsburgh', rank: 58, overallScore: 72.0 },
  { id: 59, value: 'lmu_munich', label: 'Ludwig-Maximilians-Universität München', country: 'Germany', city: 'Munich', rank: 59, overallScore: 71.6 },
  { id: 60, value: 'um_malaysia', label: 'Universiti Malaya (UM)', country: 'Malaysia', city: 'Kuala Lumpur', rank: 60, overallScore: 71.2 },
  { id: 61, value: 'duke', label: 'Duke University', country: 'USA', city: 'Durham', rank: 61, overallScore: 70.8 },
  { id: 62, value: 'cityu_hk', label: 'City University of Hong Kong (CityUHK)', country: 'Hong Kong SAR', city: 'Kowloon', rank: 62, overallScore: 70.7 },
  { id: 63, value: 'ku_leuven', label: 'KU Leuven', country: 'Belgium', city: 'Leuven', rank: 63, overallScore: 70.3 },
  { id: 64, value: 'sorbonne', label: 'Sorbonne University', country: 'France', city: 'Paris', rank: 63, overallScore: 70.3 },
  { id: 65, value: 'auckland', label: 'The University of Auckland', country: 'New Zealand', city: 'Auckland', rank: 65, overallScore: 69.7 },
  { id: 66, value: 'texas_austin', label: 'University of Texas at Austin', country: 'USA', city: 'Austin', rank: 66, overallScore: 69.5 },
  { id: 67, value: 'korea', label: 'Korea University', country: 'South Korea', city: 'Seoul', rank: 67, overallScore: 69.0 },
  { id: 68, value: 'ntu_taiwan', label: 'National Taiwan University (NTU)', country: 'Taiwan', city: 'Taipei', rank: 68, overallScore: 68.7 },
  { id: 69, value: 'warwick', label: 'The University of Warwick', country: 'UK', city: 'Coventry', rank: 69, overallScore: 68.2 },
  { id: 70, value: 'illinois', label: 'University of Illinois at Urbana-Champaign', country: 'USA', city: 'Champaign', rank: 69, overallScore: 68.2 },
  { id: 71, value: 'uba', label: 'Universidad de Buenos Aires (UBA)', country: 'Argentina', city: 'Buenos Aires', rank: 71, overallScore: 67.6 },
  { id: 72, value: 'ucsd', label: 'University of California, San Diego (UCSD)', country: 'USA', city: 'San Diego', rank: 72, overallScore: 67.1 },
  { id: 73, value: 'paris_saclay', label: 'Université Paris-Saclay', country: 'France', city: 'Gif-sur-Yvette', rank: 73, overallScore: 67.0 },
  { id: 74, value: 'kth', label: 'KTH Royal Institute of Technology', country: 'Sweden', city: 'Stockholm', rank: 74, overallScore: 65.7 },
  { id: 75, value: 'lund', label: 'Lund University', country: 'Sweden', city: 'Lund', rank: 75, overallScore: 65.6 },
  { id: 76, value: 'washington', label: 'University of Washington', country: 'USA', city: 'Seattle', rank: 76, overallScore: 65.3 },
  { id: 77, value: 'western_australia', label: 'The University of Western Australia', country: 'Australia', city: 'Perth', rank: 77, overallScore: 65.2 },
  { id: 78, value: 'glasgow', label: 'University of Glasgow', country: 'UK', city: 'Glasgow', rank: 78, overallScore: 65.0 },
  { id: 79, value: 'brown', label: 'Brown University', country: 'USA', city: 'Providence', rank: 79, overallScore: 64.7 },
  { id: 80, value: 'birmingham', label: 'University of Birmingham', country: 'UK', city: 'Birmingham', rank: 80, overallScore: 64.1 },
  { id: 81, value: 'southampton', label: 'University of Southampton', country: 'UK', city: 'Southampton', rank: 80, overallScore: 64.1 },
  { id: 82, value: 'adelaide', label: 'The University of Adelaide', country: 'Australia', city: 'Adelaide', rank: 82, overallScore: 63.8 },
  { id: 83, value: 'leeds', label: 'University of Leeds', country: 'UK', city: 'Leeds', rank: 82, overallScore: 63.8 },
  { id: 84, value: 'heidelberg', label: 'Universität Heidelberg', country: 'Germany', city: 'Heidelberg', rank: 84, overallScore: 63.7 },
  { id: 85, value: 'tokyo_tech', label: 'Tokyo Institute of Technology (Tokyo Tech)', country: 'Japan', city: 'Tokyo', rank: 84, overallScore: 63.7 },
  { id: 86, value: 'osaka', label: 'Osaka University', country: 'Japan', city: 'Osaka City', rank: 86, overallScore: 63.5 },
  { id: 87, value: 'trinity_dublin', label: 'Trinity College Dublin, The University of Dublin', country: 'Ireland', city: 'Dublin', rank: 87, overallScore: 62.9 },
  { id: 88, value: 'uts', label: 'University of Technology Sydney', country: 'Australia', city: 'Haymarket', rank: 88, overallScore: 62.4 },
  { id: 89, value: 'durham', label: 'Durham University', country: 'UK', city: 'Durham', rank: 89, overallScore: 61.7 },
  { id: 90, value: 'penn_state', label: 'Pennsylvania State University', country: 'USA', city: 'University Park', rank: 89, overallScore: 61.7 },
  { id: 91, value: 'purdue', label: 'Purdue University', country: 'USA', city: 'West Lafayette', rank: 89, overallScore: 61.7 },
  { id: 92, value: 'usp', label: 'Universidade de São Paulo', country: 'Brazil', city: 'São Paulo', rank: 92, overallScore: 61.6 },
  { id: 93, value: 'puc_chile', label: 'Pontificia Universidad Católica de Chile (UC)', country: 'Chile', city: 'Santiago', rank: 93, overallScore: 61.5 },
  { id: 94, value: 'moscow_state', label: 'Lomonosov Moscow State University', country: 'Russia', city: 'Moscow', rank: 94, overallScore: 61.4 },
  { id: 95, value: 'unam', label: 'Universidad Nacional Autónoma de México (UNAM)', country: 'Mexico', city: 'Mexico City', rank: 94, overallScore: 61.4 },
  { id: 96, value: 'alberta', label: 'University of Alberta', country: 'Canada', city: 'Edmonton', rank: 96, overallScore: 61.2 },
  { id: 97, value: 'fu_berlin', label: 'Freie Universitaet Berlin', country: 'Germany', city: 'Berlin', rank: 97, overallScore: 60.6 },
  { id: 98, value: 'postech', label: 'Pohang University of Science And Technology (POSTECH)', country: 'South Korea', city: 'Pohang', rank: 98, overallScore: 60.3 },
  { id: 99, value: 'rwth_aachen', label: 'RWTH Aachen University', country: 'Germany', city: 'Aachen', rank: 99, overallScore: 59.9 },
  { id: 100, value: 'copenhagen', label: 'University of Copenhagen', country: 'Denmark', city: 'Copenhagen', rank: 100, overallScore: 59.6 },
  { id: 101, value: 'kfupm', label: 'KFUPM', country: 'Saudi Arabia', city: 'Dhahran', rank: 101, overallScore: 59.5 },
  { id: 102, value: 'kit', label: 'KIT, Karlsruhe Institute of Technology', country: 'Germany', city: 'Karlsruhe', rank: 102, overallScore: 59.4 },
  { id: 103, value: 'uppsala', label: 'Uppsala University', country: 'Sweden', city: 'Uppsala', rank: 103, overallScore: 59.3 },
  { id: 104, value: 'st_andrews', label: 'University of St Andrews', country: 'UK', city: 'St. Andrews', rank: 104, overallScore: 59.2 },
  { id: 105, value: 'sheffield', label: 'The University of Sheffield', country: 'UK', city: 'Sheffield', rank: 105, overallScore: 59.1 },
  { id: 106, value: 'utrecht', label: 'Utrecht University', country: 'Netherlands', city: 'Utrecht', rank: 105, overallScore: 59.1 },
  { id: 107, value: 'tohoku', label: 'Tohoku University', country: 'Japan', city: 'Sendai City', rank: 107, overallScore: 58.8 },
  { id: 108, value: 'boston', label: 'Boston University', country: 'USA', city: 'Boston', rank: 108, overallScore: 58.6 },
  { id: 109, value: 'nottingham', label: 'University of Nottingham', country: 'UK', city: 'Nottingham', rank: 108, overallScore: 58.5 },
  { id: 110, value: 'dtu', label: 'Technical University of Denmark', country: 'Denmark', city: 'Kongens Lyngby', rank: 109, overallScore: 58.3 },
  { id: 111, value: 'zurich', label: 'University of Zurich', country: 'Switzerland', city: 'Zürich', rank: 109, overallScore: 58.3 },
  { id: 112, value: 'polimi', label: 'Politecnico di Milano', country: 'Italy', city: 'Milan', rank: 111, overallScore: 58.2 },
  { id: 113, value: 'aalto', label: 'Aalto University', country: 'Finland', city: 'Espoo', rank: 113, overallScore: 57.9 },
  { id: 114, value: 'georgia_tech', label: 'Georgia Institute of Technology', country: 'USA', city: 'Atlanta', rank: 114, overallScore: 57.3 },
  { id: 115, value: 'waterloo', label: 'University of Waterloo', country: 'Canada', city: 'Waterloo', rank: 115, overallScore: 57.2 },
  { id: 116, value: 'wisconsin', label: 'University of Wisconsin-Madison', country: 'USA', city: 'Madison', rank: 116, overallScore: 57.1 },
  { id: 117, value: 'helsinki', label: 'University of Helsinki', country: 'Finland', city: 'Helsinki', rank: 117, overallScore: 56.8 },
  { id: 118, value: 'iitb', label: 'Indian Institute of Technology Bombay (IITB)', country: 'India', city: 'Mumbai', rank: 118, overallScore: 56.3 },
  { id: 119, value: 'oslo', label: 'University of Oslo', country: 'Norway', city: 'Oslo', rank: 119, overallScore: 56.1 },
  { id: 120, value: 'qmul', label: 'Queen Mary University of London', country: 'UK', city: 'London', rank: 120, overallScore: 55.8 },
  { id: 121, value: 'western', label: 'Western University', country: 'Canada', city: 'London', rank: 120, overallScore: 55.8 },
  { id: 122, value: 'qatar', label: 'Qatar University', country: 'Qatar', city: 'Doha', rank: 122, overallScore: 55.7 },
  { id: 123, value: 'rmit', label: 'RMIT University', country: 'Australia', city: 'Melbourne', rank: 123, overallScore: 55.5 },
  { id: 124, value: 'skku', label: 'Sungkyunkwan University (SKKU)', country: 'South Korea', city: 'Suwon', rank: 123, overallScore: 55.5 },
  { id: 125, value: 'usc', label: 'University of Southern California', country: 'USA', city: 'Los Angeles', rank: 125, overallScore: 55.2 },
  { id: 126, value: 'hu_berlin', label: 'Humboldt-Universität zu Berlin', country: 'Germany', city: 'Berlin', rank: 126, overallScore: 55.0 },
  { id: 127, value: 'ucd', label: 'University College Dublin', country: 'Ireland', city: 'Dublin', rank: 126, overallScore: 55.0 },
  { id: 128, value: 'stockholm', label: 'Stockholm University', country: 'Sweden', city: 'Stockholm', rank: 128, overallScore: 54.8 },
  { id: 129, value: 'newcastle', label: 'Newcastle University', country: 'UK', city: 'Newcastle upon Tyne', rank: 129, overallScore: 54.5 },
  { id: 130, value: 'uc_davis', label: 'University of California, Davis', country: 'USA', city: 'Davis', rank: 130, overallScore: 54.4 },
  { id: 131, value: 'basel', label: 'University of Basel', country: 'Switzerland', city: 'Basel', rank: 131, overallScore: 54.3 },
  { id: 132, value: 'sapienza', label: 'Sapienza University of Rome', country: 'Italy', city: 'Rome', rank: 132, overallScore: 54.2 },
  { id: 133, value: 'bologna', label: 'Alma Mater Studiorum - Università di Bologna', country: 'Italy', city: 'Bologna', rank: 133, overallScore: 54.1 },
  { id: 134, value: 'macquarie', label: 'Macquarie University', country: 'Australia', city: 'Sydney', rank: 133, overallScore: 54.1 },
  { id: 135, value: 'ustc', label: 'University of Science and Technology of China', country: 'China', city: 'Hefei', rank: 133, overallScore: 54.1 },
  { id: 136, value: 'eindhoven', label: 'Eindhoven University of Technology', country: 'Netherlands', city: 'Eindhoven', rank: 136, overallScore: 54.0 },
  { id: 137, value: 'vienna', label: 'University of Vienna', country: 'Austria', city: 'Vienna', rank: 137, overallScore: 53.9 },
  { id: 138, value: 'ukm', label: 'Universiti Kebangsaan Malaysia (UKM)', country: 'Malaysia', city: 'Bangi', rank: 138, overallScore: 53.8 },
  { id: 139, value: 'chalmers', label: 'Chalmers University of Technology', country: 'Sweden', city: 'Gothenburg', rank: 139, overallScore: 53.7 },
  { id: 140, value: 'uchile', label: 'Universidad de Chile', country: 'Chile', city: 'Santiago', rank: 139, overallScore: 53.7 },
  { id: 141, value: 'lancaster', label: 'Lancaster University', country: 'UK', city: 'Lancaster', rank: 141, overallScore: 53.6 },
  { id: 142, value: 'leiden', label: 'Leiden University', country: 'Netherlands', city: 'Leiden', rank: 141, overallScore: 53.6 },
  { id: 143, value: 'rice', label: 'Rice University', country: 'USA', city: 'Houston', rank: 141, overallScore: 53.6 },
  { id: 144, value: 'aarhus', label: 'Aarhus University', country: 'Denmark', city: 'Aarhus', rank: 144, overallScore: 53.3 },
  { id: 145, value: 'nanjing', label: 'Nanjing University', country: 'China', city: 'Nanjing', rank: 145, overallScore: 53.0 },
  { id: 146, value: 'usm', label: 'Universiti Sains Malaysia (USM)', country: 'Malaysia', city: 'Gelugor', rank: 146, overallScore: 52.7 },
  { id: 147, value: 'tu_berlin', label: 'Technische Universität Berlin (TU Berlin)', country: 'Germany', city: 'Berlin', rank: 147, overallScore: 52.5 },
  { id: 148, value: 'upm', label: 'Universiti Putra Malaysia (UPM)', country: 'Malaysia', city: 'Serdang', rank: 148, overallScore: 52.3 },
  { id: 149, value: 'kau', label: 'King Abdulaziz University (KAU)', country: 'Saudi Arabia', city: 'Jeddah', rank: 149, overallScore: 52.2 },
  { id: 150, value: 'iitd', label: 'Indian Institute of Technology Delhi (IITD)', country: 'India', city: 'New Delhi', rank: 150, overallScore: 52.1 },
  { id: 151, value: 'bath', label: 'University of Bath', country: 'UK', city: 'Bath', rank: 150, overallScore: 52.1 },
  { id: 152, value: 'michigan_state', label: 'Michigan State University', country: 'USA', city: 'East Lansing', rank: 152, overallScore: 51.9 },
  { id: 153, value: 'nagoya', label: 'Nagoya University', country: 'Japan', city: 'Nagoya', rank: 152, overallScore: 51.9 },
  { id: 154, value: 'texas_am', label: 'Texas A&M University', country: 'USA', city: 'College Station', rank: 154, overallScore: 51.8 },
  { id: 155, value: 'geneva', label: 'University of Geneva', country: 'Switzerland', city: 'Geneva', rank: 155, overallScore: 51.6 },
  { id: 156, value: 'unc', label: 'University of North Carolina at Chapel Hill', country: 'USA', city: 'Chapel Hill', rank: 155, overallScore: 51.6 },
  { id: 157, value: 'wageningen', label: 'Wageningen University & Research', country: 'Netherlands', city: 'Wageningen', rank: 155, overallScore: 51.6 },
  { id: 158, value: 'erasmus', label: 'Erasmus University Rotterdam', country: 'Netherlands', city: 'Rotterdam', rank: 158, overallScore: 51.5 },
  { id: 159, value: 'groningen', label: 'University of Groningen', country: 'Netherlands', city: 'Groningen', rank: 159, overallScore: 51.3 },
  { id: 160, value: 'montreal', label: 'Université de Montréal', country: 'Canada', city: 'Montreal', rank: 159, overallScore: 51.3 },
  { id: 161, value: 'bern', label: 'University of Bern', country: 'Switzerland', city: 'Bern', rank: 161, overallScore: 51.2 },
  { id: 162, value: 'hanyang', label: 'Hanyang University', country: 'South Korea', city: 'Seoul', rank: 162, overallScore: 51.1 },
  { id: 163, value: 'kazakh', label: 'Al-Farabi Kazakh National University', country: 'Kazakhstan', city: 'Almaty', rank: 163, overallScore: 51.0 },
  { id: 164, value: 'complutense', label: 'Complutense University of Madrid', country: 'Spain', city: 'Madrid', rank: 164, overallScore: 50.9 },
  { id: 165, value: 'barcelona', label: 'Universitat de Barcelona', country: 'Spain', city: 'Barcelona', rank: 165, overallScore: 50.7 },
  { id: 166, value: 'liverpool', label: 'University of Liverpool', country: 'UK', city: 'Liverpool', rank: 165, overallScore: 50.7 },
  { id: 167, value: 'kyushu', label: 'Kyushu University', country: 'Japan', city: 'Fukuoka City', rank: 167, overallScore: 50.3 },
  { id: 168, value: 'wollongong', label: 'University of Wollongong', country: 'Australia', city: 'Wollongong', rank: 167, overallScore: 50.3 },
  { id: 169, value: 'ghent', label: 'Ghent University', country: 'Belgium', city: 'Ghent', rank: 169, overallScore: 50.1 },
  { id: 170, value: 'exeter', label: 'University of Exeter', country: 'UK', city: 'Exeter', rank: 169, overallScore: 50.1 },
  { id: 171, value: 'cape_town', label: 'University of Cape Town', country: 'South Africa', city: 'Cape Town', rank: 171, overallScore: 50.0 },
  { id: 172, value: 'reading', label: 'University of Reading', country: 'UK', city: 'Reading', rank: 172, overallScore: 49.9 },
  { id: 173, value: 'wustl', label: 'Washington University in St. Louis', country: 'USA', city: 'St. Louis', rank: 171, overallScore: 49.9 },
  { id: 174, value: 'hokkaido', label: 'Hokkaido University', country: 'Japan', city: 'Sapporo', rank: 173, overallScore: 49.8 },
  { id: 175, value: 'curtin', label: 'Curtin University', country: 'Australia', city: 'Perth', rank: 174, overallScore: 49.3 },
  { id: 176, value: 'uab', label: 'Universitat Autònoma de Barcelona', country: 'Spain', city: 'Barcelona', rank: 175, overallScore: 49.2 },
  { id: 177, value: 'mcmaster', label: 'McMaster University', country: 'Canada', city: 'Hamilton', rank: 176, overallScore: 49.0 },
  { id: 178, value: 'ucsb', label: 'University of California, Santa Barbara (UCSB)', country: 'USA', city: 'Santa Barbara', rank: 178, overallScore: 48.9 },
  { id: 179, value: 'newcastle_au', label: 'The University of Newcastle, Australia (UON)', country: 'Australia', city: 'Callaghan', rank: 179, overallScore: 48.7 },
  { id: 180, value: 'uniandes', label: 'Universidad de los Andes', country: 'Colombia', city: 'Bogotá', rank: 179, overallScore: 48.7 },
  { id: 181, value: 'utm', label: 'Universiti Teknologi Malaysia', country: 'Malaysia', city: 'Skudai', rank: 181, overallScore: 48.5 },
  { id: 182, value: 'waseda', label: 'Waseda University', country: 'Japan', city: 'Tokyo', rank: 181, overallScore: 48.5 },
  { id: 183, value: 'hbku', label: 'Hamad bin Khalifa University', country: 'Qatar', city: 'Doha', rank: 183, overallScore: 48.3 },
  { id: 184, value: 'york', label: 'University of York', country: 'UK', city: 'York', rank: 184, overallScore: 48.2 },
  { id: 185, value: 'tec_monterrey', label: 'Tecnológico de Monterrey', country: 'Mexico', city: 'Monterrey', rank: 185, overallScore: 48.1 },
  { id: 186, value: 'cardiff', label: 'Cardiff University', country: 'UK', city: 'Cardiff', rank: 186, overallScore: 47.6 },
  { id: 187, value: 'ens_lyon', label: 'École Normale Supérieure de Lyon', country: 'France', city: 'Lyon', rank: 187, overallScore: 47.5 },
  { id: 188, value: 'keio', label: 'Keio University', country: 'Japan', city: 'Tokyo', rank: 188, overallScore: 47.4 },
  { id: 189, value: 'ottawa', label: 'University of Ottawa', country: 'Canada', city: 'Ottawa', rank: 189, overallScore: 47.3 },
  { id: 190, value: 'tu_wien', label: 'Technische Universität Wien', country: 'Austria', city: 'Vienna', rank: 190, overallScore: 47.2 },
  { id: 191, value: 'hamburg', label: 'Universität Hamburg', country: 'Germany', city: 'Hamburg', rank: 191, overallScore: 47.1 },
  { id: 192, value: 'tongji', label: 'Tongji University', country: 'China', city: 'Shanghai', rank: 192, overallScore: 46.9 },
  { id: 193, value: 'queens_kingston', label: "Queen's University at Kingston", country: 'Canada', city: 'Kingston', rank: 193, overallScore: 46.8 },
  { id: 194, value: 'gothenburg', label: 'University of Gothenburg', country: 'Sweden', city: 'Gothenburg', rank: 194, overallScore: 46.7 },
  { id: 195, value: 'wuhan', label: 'Wuhan University', country: 'China', city: 'Wuhan', rank: 194, overallScore: 46.7 },
  { id: 196, value: 'emory', label: 'Emory University', country: 'USA', city: 'Atlanta', rank: 196, overallScore: 46.6 },
  { id: 197, value: 'deakin', label: 'Deakin University', country: 'Australia', city: 'Burwood', rank: 197, overallScore: 46.4 },
  { id: 198, value: 'uam', label: 'Universidad Autónoma de Madrid', country: 'Spain', city: 'Madrid', rank: 198, overallScore: 46.3 },
  { id: 199, value: 'calgary', label: 'University of Calgary', country: 'Canada', city: 'Calgary', rank: 198, overallScore: 46.3 },
  { id: 200, value: 'arizona_state', label: 'Arizona State University', country: 'USA', city: 'Tempe', rank: 200, overallScore: 46.2 },
  { id: 201, value: 'ksu', label: 'King Saud University', country: 'Saudi Arabia', city: 'Riyadh', rank: 200, overallScore: 46.2 },
]

// Get unique countries from the universities list
export const countries: string[] = Array.from(new Set(universities.map(u => u.country))).sort()

// Default courses applicable to most universities
export const defaultCourses = [
  { value: 'mba', label: 'Master of Business Administration (MBA)' },
  { value: 'ms_cs', label: 'Master of Science in Computer Science' },
  { value: 'ms_ds', label: 'Master of Science in Data Science' },
  { value: 'ms_eng', label: 'Master of Science in Engineering' },
  { value: 'ms_ai', label: 'Master of Science in Artificial Intelligence' },
  { value: 'ms_fin', label: 'Master of Science in Finance' },
  { value: 'ma', label: 'Master of Arts (MA)' },
  { value: 'msc', label: 'Master of Science (MSc)' },
  { value: 'llm', label: 'Master of Laws (LL.M.)' },
  { value: 'mpa', label: 'Master of Public Administration (MPA)' },
  { value: 'mph', label: 'Master of Public Health (MPH)' },
  { value: 'mba_exec', label: 'Executive MBA' },
  { value: 'phd', label: 'Doctor of Philosophy (PhD)' },
]

// University-specific courses (for popular universities)
export const coursesByUniversity: Record<string, { value: string; label: string }[]> = {
  harvard: [
    { value: 'mba', label: 'Master of Business Administration (MBA)' },
    { value: 'llm', label: 'Master of Laws (LL.M.)' },
    { value: 'mpa', label: 'Master of Public Administration (MPA)' },
    { value: 'med', label: 'Master of Education (M.Ed.)' },
    { value: 'mph', label: 'Master of Public Health (MPH)' },
    { value: 'mpp', label: 'Master in Public Policy (MPP)' },
  ],
  stanford: [
    { value: 'mba', label: 'Master of Business Administration (MBA)' },
    { value: 'ms_cs', label: 'Master of Science in Computer Science' },
    { value: 'ms_ee', label: 'Master of Science in Electrical Engineering' },
    { value: 'ma_edu', label: 'Master of Arts in Education' },
    { value: 'ms_env', label: 'Master of Science in Environment and Resources' },
    { value: 'ms_ai', label: 'Master of Science in Artificial Intelligence' },
  ],
  mit: [
    { value: 'mba', label: 'Master of Business Administration (MBA)' },
    { value: 'ms_cs', label: 'Master of Science in Computer Science' },
    { value: 'ms_me', label: 'Master of Science in Mechanical Engineering' },
    { value: 'ms_aero', label: 'Master of Science in Aeronautics and Astronautics' },
    { value: 'mfin', label: 'Master of Finance (MFin)' },
    { value: 'ms_ai', label: 'Master of Science in Artificial Intelligence' },
  ],
  oxford: [
    { value: 'mba', label: 'Master of Business Administration (MBA)' },
    { value: 'msc_cs', label: 'MSc Computer Science' },
    { value: 'msc_fin', label: 'MSc Financial Economics' },
    { value: 'mphil', label: 'Master of Philosophy (MPhil)' },
    { value: 'bcl', label: 'Bachelor of Civil Law (BCL)' },
    { value: 'msc_ai', label: 'MSc Artificial Intelligence' },
  ],
  cambridge: [
    { value: 'mba', label: 'Master of Business Administration (MBA)' },
    { value: 'mast', label: 'Master of Advanced Study (MASt)' },
    { value: 'mphil', label: 'Master of Philosophy (MPhil)' },
    { value: 'llm', label: 'Master of Laws (LLM)' },
    { value: 'meng', label: 'Master of Engineering (MEng)' },
  ],
  default: defaultCourses,
}

export function getCoursesForUniversity(universityValue: string): { value: string; label: string }[] {
  return coursesByUniversity[universityValue] || coursesByUniversity.default
}

// Search universities by name, country, or city
export function searchUniversities(query: string): University[] {
  if (!query) return universities
  const lowerQuery = query.toLowerCase()
  return universities.filter(u => 
    u.label.toLowerCase().includes(lowerQuery) ||
    u.country.toLowerCase().includes(lowerQuery) ||
    u.city.toLowerCase().includes(lowerQuery)
  )
}

// Get university by value
export function getUniversityByValue(value: string): University | undefined {
  return universities.find(u => u.value === value)
}

// Get university by ID
export function getUniversityById(id: number): University | undefined {
  return universities.find(u => u.id === id)
}

// Get universities by country
export function getUniversitiesByCountry(country: string): University[] {
  return universities.filter(u => u.country === country)
}
