import { PrismaClient, Prisma, User, Course, Chapter, Task, UserCourse, UserChapterProgress } from '@prisma/client'

const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.coaurbpsdjkrgoemmnqi:Mikoto@123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
})

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Mikoto123@35.200.114.166:5432/postgres"
    }
  }
})

async function migrateData() {
  console.log('Starting data migration...')

  try {
    // 1. ユーザーデータの移行
    console.log('Migrating users...')
    const users = await sourcePrisma.$queryRaw<User[]>`SELECT * FROM "User"`
    console.log(`Found ${users.length} users to migrate`)
    
    for (const user of users) {
      try {
        const { id, snsLinks, ...userData } = user
        const processedSnsLinks = snsLinks 
          ? (snsLinks as Prisma.JsonObject)
          : Prisma.JsonNull;

        await targetPrisma.user.upsert({
          where: { id },
          create: {
            ...userData,
            id,
            snsLinks: processedSnsLinks
          },
          update: {
            ...userData,
            snsLinks: processedSnsLinks
          }
        })
        console.log(`Migrated user: ${id}`)
      } catch (error) {
        console.error(`Failed to migrate user ${user.id}:`, error)
      }
    }

    // 2. コースの移行
    console.log('Migrating courses...')
    const courses = await sourcePrisma.$queryRaw<Course[]>`SELECT * FROM "Course"`
    for (const course of courses) {
      try {
        const { id, ...courseData } = course
        await targetPrisma.course.upsert({
          where: { id },
          create: { id, ...courseData },
          update: courseData
        })
        console.log(`Migrated course: ${id}`)
      } catch (error) {
        console.error(`Failed to migrate course ${course.id}:`, error)
      }
    }

    // 3. チャプターの移行
    console.log('Migrating chapters...')
    const chapters = await sourcePrisma.$queryRaw<Chapter[]>`SELECT * FROM "Chapter"`
    for (const chapter of chapters) {
      try {
        const { id, content, ...chapterData } = chapter
        const processedContent = content 
          ? (content as Prisma.JsonObject)
          : Prisma.JsonNull;

        await targetPrisma.chapter.upsert({
          where: { id },
          create: {
            ...chapterData,
            id,
            content: processedContent
          },
          update: {
            ...chapterData,
            content: processedContent
          }
        })
        console.log(`Migrated chapter: ${id}`)
      } catch (error) {
        console.error(`Failed to migrate chapter ${chapter.id}:`, error)
      }
    }

    // 4. タスクの移行
    console.log('Migrating tasks...')
    const tasks = await sourcePrisma.$queryRaw<Task[]>`SELECT * FROM "Task"`
    for (const task of tasks) {
      try {
        const { id, ...taskData } = task
        await targetPrisma.task.upsert({
          where: { id },
          create: { id, ...taskData },
          update: taskData
        })
        console.log(`Migrated task: ${id}`)
      } catch (error) {
        console.error(`Failed to migrate task ${task.id}:`, error)
      }
    }

    // 5. ユーザーコースの移行
    console.log('Migrating user courses...')
    const userCourses = await sourcePrisma.$queryRaw<UserCourse[]>`SELECT * FROM "UserCourse"`
    for (const userCourse of userCourses) {
      try {
        const { id, ...courseData } = userCourse
        await targetPrisma.userCourse.upsert({
          where: {
            userId_courseId: {
              userId: userCourse.userId,
              courseId: userCourse.courseId
            }
          },
          create: { id, ...courseData },
          update: courseData
        })
        console.log(`Migrated userCourse: ${userCourse.userId}-${userCourse.courseId}`)
      } catch (error) {
        console.error(`Failed to migrate userCourse for user ${userCourse.userId}:`, error)
      }
    }

    // 6. チャプター進捗の移行
    console.log('Migrating chapter progress...')
    const chapterProgress = await sourcePrisma.$queryRaw<UserChapterProgress[]>`SELECT * FROM "UserChapterProgress"`
    for (const progress of chapterProgress) {
      try {
        const { id, ...progressData } = progress
        await targetPrisma.userChapterProgress.upsert({
          where: {
            userId_courseId_chapterId: {
              userId: progress.userId,
              courseId: progress.courseId,
              chapterId: progress.chapterId
            }
          },
          create: { id, ...progressData },
          update: progressData
        })
        console.log(`Migrated chapter progress: ${progress.userId}-${progress.chapterId}`)
      } catch (error) {
        console.error(`Failed to migrate chapter progress:`, error)
      }
    }

    console.log('Migration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await sourcePrisma.$disconnect()
    await targetPrisma.$disconnect()
  }
}

// 移行の実行
migrateData()
  .catch(console.error)
  .finally(() => {
    console.log('Migration script finished')
  })