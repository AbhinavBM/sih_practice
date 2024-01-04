from mrjob.job import MRJob

class UberAnalysis(MRJob):

    def mapper(self, _, line):
        # Split the line into columns
        columns = line.strip().split(',')

        # Extract relevant information
        base_number = columns[0]
        date = columns[1]
        trips = int(columns[3])

        # Emit key-value pairs (date, (base_number, trips))
        yield date, (base_number, trips)

    def reducer(self, key, values):
        # Calculate total trips for each base on a given date
        total_trips_per_base = {}

        for base_number, trips in values:
            if base_number not in total_trips_per_base:
                total_trips_per_base[base_number] = 0
            total_trips_per_base[base_number] += trips

        # Find the base with the maximum trips on the current date
        max_base = max(total_trips_per_base, key=total_trips_per_base.get)

        # Emit the result (date, base with max trips)
        yield key, max_base

if __name__ == '__main__':
    UberAnalysis.run()
