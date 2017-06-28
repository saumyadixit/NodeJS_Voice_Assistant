import sys

input_file = sys.argv[1]
out_file = sys.argv[2]
#var wordList = [
#   ["ONE", "W AH N"],
#   ["TWO", "T UW"]
#];

finp = open(input_file,'r')
fout = open(out_file,"w")

#write header
fout.write("var wordlist = [\n")
lines = finp.readlines()
numberofwords=len(lines)

for line in lines:
    line = line.replace("\n","")
    line = line.replace("\r","") 
    #Check the line and decode text
    pos=line.find("\t")
    word=line[0:pos]
    phenomes=line[pos+1:]
    numberofwords=numberofwords-1
    output="    [\""+word+"\",  \""+phenomes+"\"]"
    if numberofwords > 0:
        output=output+","
    fout.write(output+"\n")
    #print(word)
    #print("\n")
    #print(phenomes)
    #print("\n")
    #print("\n")
fout.write("];\n")
fout.close()